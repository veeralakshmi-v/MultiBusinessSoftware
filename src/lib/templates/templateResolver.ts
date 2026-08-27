import { BusinessTemplate, BusinessType } from '../../types/template';
import { ALL_BUSINESS_TEMPLATES, RESTAURANT_TEMPLATE } from './businessTemplates';

export class TemplateResolver {
  /**
   * Retrieves the base business template for a given vertical.
   */
  public static getTemplate(templateId: BusinessType = 'RESTAURANT'): BusinessTemplate {
    return ALL_BUSINESS_TEMPLATES[templateId] || RESTAURANT_TEMPLATE;
  }

  /**
   * Returns all available pre-configured enterprise business templates.
   */
  public static getAllTemplates(): BusinessTemplate[] {
    return Object.values(ALL_BUSINESS_TEMPLATES).filter(
      (tmpl, index, self) => self.findIndex(t => t.templateId === tmpl.templateId) === index
    );
  }

  /**
   * Returns a list of all supported business type keys.
   */
  public static getSupportedBusinessTypes(): BusinessType[] {
    return Object.keys(ALL_BUSINESS_TEMPLATES) as BusinessType[];
  }

  /**
   * Resolves a business template with deep custom overrides from database / tenant configuration.
   */
  public static resolveTemplate(
    templateId: BusinessType = 'RESTAURANT',
    customOverrides?: Partial<BusinessTemplate>
  ): BusinessTemplate {
    const baseTemplate = this.getTemplate(templateId);
    if (!customOverrides) return baseTemplate;

    return {
      ...baseTemplate,
      ...customOverrides,
      modules: { ...baseTemplate.modules, ...customOverrides.modules },
      productFields: {
        ...baseTemplate.productFields,
        ...customOverrides.productFields,
        customAttributes: [
          ...(baseTemplate.productFields.customAttributes || []),
          ...(customOverrides.productFields?.customAttributes || []),
        ].filter((attr, idx, self) => self.findIndex(a => a.key === attr.key) === idx),
      },
      customerFields: {
        ...baseTemplate.customerFields,
        ...customOverrides.customerFields,
      },
      invoiceLayout: {
        ...baseTemplate.invoiceLayout,
        ...customOverrides.invoiceLayout,
      },
      taxRules: {
        ...baseTemplate.taxRules,
        ...customOverrides.taxRules,
      },
      workflows: {
        ...baseTemplate.workflows,
        ...customOverrides.workflows,
      },
      settingsDefaults: {
        ...baseTemplate.settingsDefaults,
        ...customOverrides.settingsDefaults,
      },
      terms: {
        ...baseTemplate.terms,
        ...customOverrides.terms,
      },
    };
  }

  /**
   * Helper to retrieve starter categories for a specific business vertical.
   */
  public static getStarterCategories(templateId: BusinessType = 'RESTAURANT') {
    const template = this.getTemplate(templateId);
    return template.categories || [];
  }

  /**
   * Helper to retrieve the order status pipeline for a vertical.
   */
  public static getWorkflowPipeline(templateId: BusinessType = 'RESTAURANT') {
    const template = this.getTemplate(templateId);
    return template.workflows?.orderStatusPipeline || [];
  }
}
