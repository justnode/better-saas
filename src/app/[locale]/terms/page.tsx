import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import Link from 'next/link';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TermsPageContent />
  );
}

function TermsPageContent() {
  const t = useTranslations('legal.terms');

  const currentDate = new Date().toLocaleDateString();

  const sections = [
    { key: 'acceptance', icon: Shield },
    { key: 'useOfService', icon: Users },
    { key: 'userAccounts', icon: FileText },
    { key: 'privacy', icon: Shield },
    { key: 'termination', icon: AlertTriangle },
    { key: 'changes', icon: RefreshCw },
    { key: 'contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="text-xs">
              Legal Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('introduction')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            {t('lastUpdated', { date: currentDate })}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={section.key} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {t(`${section.key}.title`)}
                      </CardTitle>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 mt-1"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {t(`${section.key}.content`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border-0">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              If you have any questions about these terms, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="default" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
