'use client';

import { AdminGuard } from '@/components/admin-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useAppConfig,
  useFeaturesConfig,
  useI18nConfig,
  useThemeConfig,
  usePaymentConfig,
} from '@/hooks/use-config';
import { Settings, Palette, Globe, CreditCard, Zap, Shield } from 'lucide-react';
import type { PaymentPlan } from '@/types'; 

export default function ConfigPage() {
  const appConfig = useAppConfig();
  const featuresConfig = useFeaturesConfig();
  const i18nConfig = useI18nConfig();
  const themeConfig = useThemeConfig(); 
  const paymentConfig = usePaymentConfig();

  return (
    <AdminGuard>
      <div className='container mx-auto space-y-6 p-6'>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className='font-bold text-3xl'>System Configuration</h1>
              <p className="text-muted-foreground">
                Administrator panel - View and manage application configuration
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Admin Only
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* App Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                App Configuration
              </CardTitle>
              <CardDescription>Basic application settings and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className='font-medium text-sm'>App Name</div>
                  <p className='text-muted-foreground text-sm'>{appConfig.app.name}</p>
                </div>
                <div>
                  <div className='font-medium text-sm'>Version</div>
                  <p className='text-muted-foreground text-sm'>{appConfig.app.version}</p>
                </div>
                <div>
                  <div className='font-medium text-sm'>App URL</div>
                  <p className='text-muted-foreground text-sm'>{appConfig.app.url}</p>
                </div>
                <div>
                  <div className='font-medium text-sm'>Domain</div>
                  <p className='text-muted-foreground text-sm'>{appConfig.app.domain}</p>
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Description</div>
                <p className='text-muted-foreground text-sm'>{appConfig.metadata.description}</p>
              </div>

              <div>
                <div className='font-medium text-sm'>File Upload</div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    Max Size: {Math.round(appConfig.upload.maxFileSize / (1024 * 1024))}MB
                  </p>
                  <p className="text-sm">
                    Allowed Types: {appConfig.upload.allowedTypes.join(', ')}
                  </p>
                  <p className="text-sm">Max Files: {appConfig.upload.maxFiles}</p>
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Pagination</div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    Default Page Size: {appConfig.pagination.defaultPageSize}
                  </p>
                  <p className="text-sm">Max Page Size: {appConfig.pagination.maxPageSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>Enabled and disabled features in your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(featuresConfig).map(([key, value]) => (
                  <div
                    key={key}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <span className='font-medium text-sm capitalize'>{key}</span>
                    <Badge variant={value ? 'default' : 'secondary'}>
                      {value ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* I18n Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Internationalization
              </CardTitle>
              <CardDescription>Language and localization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className='font-medium text-sm'>Default Locale</div>
                  <p className='text-muted-foreground text-sm'>{i18nConfig.defaultLocale}</p>
                </div>
                <div>
                  <div className='font-medium text-sm'>Fallback Locale</div>
                  <p className='text-muted-foreground text-sm'>{i18nConfig.fallbackLocale}</p>
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Supported Languages</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {i18nConfig.locales.map((locale: string) => (
                    <Badge key={locale} variant="outline">
                      {i18nConfig.languages[locale]?.name} ({locale})
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Routing Configuration</div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Locale Prefix: {i18nConfig.routing.localePrefix}</p>
                  <p className="text-sm">
                    Locale Detection: {i18nConfig.routing.localeDetection ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Configuration
              </CardTitle>
              <CardDescription>Visual appearance and styling settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className='font-medium text-sm'>Default Theme</div>
                  <Badge variant="outline">{themeConfig.defaultTheme}</Badge>
                </div>
                <div>
                  <div className='font-medium text-sm'>Primary Color</div>
                  <div className="flex items-center gap-2">
                    <div
                      className='h-4 w-4 rounded border'
                      style={{ backgroundColor: themeConfig.colors.primary['500'] }}
                    />
                    <span className='text-muted-foreground text-sm'>
                      {themeConfig.colors.primary['500']}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Available Themes</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {themeConfig.themes.map((theme: string) => (
                    <Badge key={theme} variant="outline">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Typography</div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Sans Serif: {themeConfig.fonts.sans.join(', ')}</p>
                  <p className="text-sm">Monospace: {themeConfig.fonts.mono.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>Payment provider and billing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className='font-medium text-sm'>Provider</div>
                  <Badge variant="outline">{paymentConfig.provider}</Badge>
                </div>
                <div>
                  <div className='font-medium text-sm'>Currency</div>
                  <Badge variant="outline">{paymentConfig.currency}</Badge>
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Trial Settings</div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Enabled: {paymentConfig.trial.enabled ? 'Yes' : 'No'}</p>
                  <p className="text-sm">Duration: {paymentConfig.trial.days} days</p>
                </div>
              </div>

              <div>
                <div className='font-medium text-sm'>Available Plans</div>
                <div className="mt-2 space-y-2">
                  {paymentConfig.plans.map((plan: PaymentPlan) => (
                    <div
                      key={plan.id}
                      className='flex items-center justify-between rounded-lg border p-3'
                    >
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className='text-muted-foreground text-sm'>{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className='font-medium text-sm'>${plan.price}</p>
                        <p className='text-muted-foreground text-xs'>
                          {plan.interval || 'one-time'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
