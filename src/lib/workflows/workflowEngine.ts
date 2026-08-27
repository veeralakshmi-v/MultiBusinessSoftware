import { BusinessTemplate } from '../../types/template';
import { WorkflowStatusStep, WorkflowColor } from '../../types/workflow';

export class WorkflowEngine {
  /**
   * Retrieves the ordered workflow pipeline for a given template
   */
  static getStatusPipeline(template: BusinessTemplate): WorkflowStatusStep[] {
    return template.workflows?.orderStatusPipeline || [
      { code: 'PENDING', label: 'Order Placed', color: 'orange', nextAllowedStatuses: ['COMPLETED', 'CANCELLED'] },
      { code: 'COMPLETED', label: 'Completed', color: 'emerald', nextAllowedStatuses: [], autoDeductStock: true },
      { code: 'CANCELLED', label: 'Cancelled', color: 'red', nextAllowedStatuses: [] },
    ];
  }

  /**
   * Gets the definition of a specific status code within the template's workflow
   */
  static getStep(statusCode: string, template: BusinessTemplate): WorkflowStatusStep | undefined {
    const pipeline = this.getStatusPipeline(template);
    return pipeline.find(s => s.code.toUpperCase() === statusCode.toUpperCase());
  }

  /**
   * Gets the default initial status for a new order/transaction
   */
  static getInitialStatus(template: BusinessTemplate): string {
    return template.workflows?.defaultInitialStatus || this.getStatusPipeline(template)[0]?.code || 'PENDING';
  }

  /**
   * Validates if a transition from currentStatus to targetStatus is allowed for a user role
   */
  static canTransition(
    currentStatus: string,
    targetStatus: string,
    userRole: string = 'ADMIN',
    template: BusinessTemplate
  ): boolean {
    if (!currentStatus || !targetStatus) return false;
    if (currentStatus.toUpperCase() === targetStatus.toUpperCase()) return true;

    // Admins can force transitions unless pipeline prohibits it
    const currentStep = this.getStep(currentStatus, template);
    if (!currentStep) return true;

    const isNextAllowed = currentStep.nextAllowedStatuses.some(
      s => s.toUpperCase() === targetStatus.toUpperCase()
    );

    if (!isNextAllowed && userRole !== 'ADMIN') {
      return false;
    }

    const targetStep = this.getStep(targetStatus, template);
    if (targetStep?.rolesAllowed && targetStep.rolesAllowed.length > 0) {
      if (!targetStep.rolesAllowed.includes(userRole) && userRole !== 'ADMIN') {
        return false;
      }
    }

    return isNextAllowed || userRole === 'ADMIN';
  }

  /**
   * Returns list of allowed next status steps for the current state and role
   */
  static getNextSteps(
    currentStatus: string,
    userRole: string = 'ADMIN',
    template: BusinessTemplate
  ): WorkflowStatusStep[] {
    const currentStep = this.getStep(currentStatus, template);
    if (!currentStep) return [];

    const pipeline = this.getStatusPipeline(template);
    return currentStep.nextAllowedStatuses
      .map(code => pipeline.find(s => s.code.toUpperCase() === code.toUpperCase()))
      .filter((step): step is WorkflowStatusStep => Boolean(step))
      .filter(step => {
        if (!step.rolesAllowed || step.rolesAllowed.length === 0 || userRole === 'ADMIN') return true;
        return step.rolesAllowed.includes(userRole);
      });
  }

  /**
   * Calculates progress metric along the normal linear pipeline
   */
  static getStepProgress(
    currentStatus: string,
    template: BusinessTemplate
  ): { currentStepIndex: number; totalSteps: number; percentage: number } {
    const pipeline = this.getStatusPipeline(template).filter(s => s.code !== 'CANCELLED');
    const idx = pipeline.findIndex(s => s.code.toUpperCase() === currentStatus.toUpperCase());
    const totalSteps = pipeline.length;

    if (idx === -1) {
      return { currentStepIndex: 1, totalSteps, percentage: 0 };
    }

    const percentage = Math.round(((idx + 1) / totalSteps) * 100);
    return {
      currentStepIndex: idx + 1,
      totalSteps,
      percentage,
    };
  }

  /**
   * Determines if stock should be deducted upon entering target status
   */
  static shouldDeductStock(targetStatus: string, template: BusinessTemplate): boolean {
    const step = this.getStep(targetStatus, template);
    return Boolean(step?.autoDeductStock);
  }

  /**
   * Visual badge styling helper for workflow colors
   */
  static getStatusBadgeStyles(color: WorkflowColor = 'slate'): { text: string; bg: string; border: string } {
    switch (color) {
      case 'orange':
      case 'amber':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'blue':
      case 'cyan':
        return { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
      case 'green':
      case 'emerald':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'purple':
        return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
      case 'red':
        return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
      default:
        return { text: 'text-gray-300', bg: 'bg-gray-800/40', border: 'border-gray-700' };
    }
  }
}
