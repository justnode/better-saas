import { Faq } from '@/components/blocks/faq/faq';
import { Features } from '@/components/blocks/features/features';
import { Footer } from '@/components/blocks/footer/footer';
import { Hero } from '@/components/blocks/hero/hero';
import { Pricing } from '@/components/blocks/pricing/pricing';
import { TechStack } from '@/components/blocks/tech-stack';
import { ComponentPreviewWrapper } from './component-preview-wrapper';

interface ServerComponentPreviewProps {
  componentId: string;
  name: string;
  code: string;
}

export function ServerComponentPreview({ componentId, name, code }: ServerComponentPreviewProps) {
  const renderComponent = () => {
    switch (componentId) {
      case 'modern-hero':
        return <Hero />;
      case 'tech-stack':
        return <TechStack />;
      case 'features':
        return <Features />;
      case 'pricing2':
        return <Pricing />;
      case 'faq3':
        return <Faq />;
      case 'footer-7':
        return <Footer />;
      default:
        return <div className="p-8 text-center text-muted-foreground">组件未找到</div>;
    }
  };

  return (
    <ComponentPreviewWrapper name={name} code={code}>
      {renderComponent()}
    </ComponentPreviewWrapper>
  );
}
