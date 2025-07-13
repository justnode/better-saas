import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Shield, Database, Share2, Lock, Cookie, UserCheck, RefreshCw, Mail, FileText } from 'lucide-react';
import Link from 'next/link';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PrivacyPageContent />
  );
}

function PrivacyPageContent() {
  const t = useTranslations('legal.privacy');

  const currentDate = new Date().toLocaleDateString();

  const sections = [
    { key: 'informationCollection', icon: Database },
    { key: 'howWeUse', icon: UserCheck },
    { key: 'informationSharing', icon: Share2 },
    { key: 'dataSecurity', icon: Lock },
    { key: 'cookies', icon: Cookie },
    { key: 'yourRights', icon: UserCheck },
    { key: 'changes', icon: RefreshCw },
    { key: 'contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
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
              Privacy Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-emerald-600" />
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
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {t(`${section.key}.title`)}
                      </CardTitle>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 mt-1" />
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
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Privacy Matters</h3>
            </div>
            <p className="text-gray-600 mb-6">
              We are committed to protecting your privacy and ensuring your data is secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="default" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
