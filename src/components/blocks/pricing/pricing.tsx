'use client';

import { ArrowRight, CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useIsAuthenticated } from '@/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { createCheckoutSession } from '@/server/actions/payment/create-subscription';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { usePaymentPlans } from '@/hooks/use-config';
import { PurchaseConfirmationDialog } from '@/components/payment/purchase-confirmation-dialog';

const pricingErrorLogger = new ErrorLogger('pricing');

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyTotal?: number;
  features: PricingFeature[];
  stripePriceIds?: {
    monthly?: string;
    yearly?: string;
  };
  button: {
    text: string;
    url?: string; // Optional, for fallback
  };
}

interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

const Pricing = ({
  heading,
  description,
  plans,
}: Pricing2Props) => {
  const t = useTranslations('pricing');

  // 使用i18n翻译或传入的props
  const finalHeading = heading || t('heading');
  const finalDescription = description || t('description');
  const [isYearly, setIsYearly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const paymentPlans = usePaymentPlans();
  
  // Use configured plans if not provided as props
  // Convert payment plans to pricing plans format if needed
  const pricingPlans = plans || paymentPlans.map((plan) => ({
    ...plan,
    monthlyPrice: plan.price === 0 ? 'Free' : `$${plan.price}`,
    yearlyPrice: plan.price === 0 ? 'Free' : `$${Math.round((plan.yearlyPrice || plan.price * 10) / 12)}`,
    yearlyTotal: plan.price === 0 ? 0 : (plan.yearlyPrice || plan.price * 10),
    features: plan.features.map((feature: string) => ({ text: feature })),
    stripePriceIds: plan.stripePriceIds || {
      monthly: plan.stripePriceId,
      yearly: plan.stripePriceId,
    },
    button: {
      text: plan.price === 0
        ? t('getStartedText')
        : t('purchaseText'),
    },
  }));

  const handlePurchaseClick = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      // If user is not logged in, redirect to login page
      router.push('/login');
      return;
    }

    // Free plan redirects directly to dashboard
    if (plan.id === 'free') {
      router.push('/dashboard');
      return;
    }

    // For paid plans, show confirmation dialog first
    setSelectedPlan(plan);
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedPlan) return;

    // Get corresponding price ID
    const priceId = isYearly 
      ? selectedPlan.stripePriceIds?.yearly 
      : selectedPlan.stripePriceIds?.monthly;

    if (!priceId) {
      toast.error('价格配置错误，请联系客服');
      setShowPurchaseDialog(false);
      return;
    }

    // Create payment session
    startTransition(async () => {
      try {
        const result = await createCheckoutSession({
          priceId,
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          // Redirect to billing page when user cancels payment, showing cancellation notice
          cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
        });

        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
        } else {
          toast.error(result.error || '创建支付会话失败');
          setShowPurchaseDialog(false);
        }
      } catch (error) {
        toast.error('创建支付会话失败');
        pricingErrorLogger.logError(error as Error, {
          operation: 'createCheckoutSession',
          priceId,
          planId: selectedPlan.id,
        });
        setShowPurchaseDialog(false);
      }
    });
  };

  const handleCancelPurchase = () => {
    setShowPurchaseDialog(false);
    setSelectedPlan(null);
  };

  return (
    <section id="pricing" className="py-16">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="text-pretty font-bold text-4xl lg:text-6xl">{finalHeading}</h2>
          <p className="text-muted-foreground lg:text-xl">{finalDescription}</p>
          <div className="flex items-center gap-3 text-lg">
            {t('monthly')}
            <Switch checked={isYearly} onCheckedChange={() => setIsYearly(!isYearly)} />
            {t('yearly')}
          </div>
          <div className="flex flex-col items-stretch gap-6 md:flex-row">
            {pricingPlans.map((plan: PricingPlan) => (
              <Card key={plan.id} className="flex w-80 flex-col justify-between text-left">
                <CardHeader>
                  <CardTitle>
                    <p>{plan.name}</p>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <span className="font-bold text-4xl">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <p className="text-muted-foreground">
                    {plan.monthlyPrice === 'Free' ? (
                      'Forever free'
                    ) : (
                      <>
                        Billed{' '}
                        {isYearly
                          ? `$${plan.yearlyTotal} annually`
                          : `$${Number(plan.monthlyPrice.slice(1))} monthly`}
                      </>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  {plan.id === 'pro' && (
                    <p className="mb-3 font-semibold">Everything in Plus, and:</p>
                  )}
                  <ul className="space-y-4">
                    {plan.features.map((feature: PricingFeature, index: number) => (
                      <li key={`${plan.id}-feature-${index}`} className="flex items-center gap-2">
                        <CircleCheck className="size-4" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchaseClick(plan)}
                    disabled={isPending}
                  >
                    {isPending ? t('processingText') : plan.button.text}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <PurchaseConfirmationDialog
        isOpen={showPurchaseDialog}
        onClose={handleCancelPurchase}
        onConfirm={handleConfirmPurchase}
        planName={selectedPlan?.name}
        isProcessing={isPending}
      />
    </section>
  );
};

export { Pricing };
