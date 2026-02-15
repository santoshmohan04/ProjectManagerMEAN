import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for business logic
 */

/**
 * Validator for priority range (0-30)
 */
export function priorityRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const priority = Number(control.value);
    if (isNaN(priority) || priority < 0 || priority > 30) {
      return {
        priorityRange: {
          valid: false,
          actualValue: control.value,
          min: 0,
          max: 30,
        },
      };
    }

    return null;
  };
}

/**
 * Validator for mandatory manager selection
 */
export function managerRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Check if manager is selected (not null/undefined and has required properties)
    if (!value || typeof value !== 'object' || !value.User_ID) {
      return {
        managerRequired: {
          valid: false,
          actualValue: value,
        },
      };
    }

    return null;
  };
}

/**
 * Validator for employee ID pattern (1-6 digits)
 */
export function employeeIdPatternValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const pattern = /^[0-9]{1,6}$/;
    if (!pattern.test(control.value.toString())) {
      return {
        employeeIdPattern: {
          valid: false,
          actualValue: control.value,
          pattern: '1-6 digits only',
        },
      };
    }

    return null;
  };
}

/**
 * Validator for date comparison (end date >= start date)
 * Note: This is now handled by the dateCompare directive, but keeping for form-level validation
 */
export function dateComparisonValidator(
  startDateControlName: string,
  endDateControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDateControl = formGroup.get(startDateControlName);
    const endDateControl = formGroup.get(endDateControlName);

    if (!startDateControl || !endDateControl) {
      return null;
    }

    const startDate = startDateControl.value;
    const endDate = endDateControl.value;

    if (!startDate || !endDate) {
      return null; // Let required validators handle empty values
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null; // Invalid dates
    }

    if (end < start) {
      return {
        dateComparison: {
          valid: false,
          startDate: startDate,
          endDate: endDate,
          message: 'End date must be after or equal to start date',
        },
      };
    }

    return null;
  };
}

/**
 * Validator for unique email (would need async validation with service)
 * Placeholder for future implementation
 */
export function uniqueEmailValidator(
  userService: any // Inject service for checking uniqueness
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // This would typically be an async validator
    // For now, return null as email field doesn't exist in current forms
    return null;
  };
}