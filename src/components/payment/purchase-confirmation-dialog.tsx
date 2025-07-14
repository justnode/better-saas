'use client';

import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreditCard, AlertTriangle } from 'lucide-react';

interface PurchaseConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName?: string;
  isProcessing?: boolean;
}

export function PurchaseConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  planName,
  isProcessing = false,
}: PurchaseConfirmationDialogProps) {
  const t = useTranslations('pricing.purchaseDialog');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              <p>{t('description')}</p>
              
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    {t('warning')}
                  </span>
                </div>
                <p className="font-mono text-sm bg-background p-2 rounded border">
                  {t('testCardNumber')}
                </p>
              </div>
              
              {planName && (
                <p className="text-sm text-muted-foreground">
                  {t('purchaseInfo', { planName: planName })}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isProcessing}>
            {t('cancelButton')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {t('processing')}
              </>
            ) : (
              t('continueButton')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 