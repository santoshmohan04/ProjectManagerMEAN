import {
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Directive, input, computed, inject } from '@angular/core';

@Directive({
  selector: '[dateCompare]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DateCompareValidatorDirective,
      multi: true,
    },
  ],
})
export class DateCompareValidatorDirective implements Validator {
  // Signal-based inputs
  compareDate = input.required<string | Date>({ alias: 'dateCompare' });
  operation = input.required<'less than' | 'greater than'>({ alias: 'operation' });

  // Computed validation logic (though not directly used in validate, for potential future use)
  private validationLogic = computed(() => ({
    compareDate: this.compareDate(),
    operation: this.operation(),
  }));

  validate(control: AbstractControl): ValidationErrors | null {
    const logic = this.validationLogic(); // Access computed for consistency

    if (!logic.compareDate || !logic.operation || !control.value) {
      return null;
    }

    // Convert values to Date objects if needed
    const sourceDate =
      control.value instanceof Date ? control.value : new Date(control.value);
    const targetDate =
      logic.compareDate instanceof Date
        ? logic.compareDate
        : new Date(logic.compareDate);

    // If either date is invalid, skip validation
    if (isNaN(sourceDate.getTime()) || isNaN(targetDate.getTime())) {
      return null;
    }

    const isValid =
      logic.operation === 'less than'
        ? targetDate >= sourceDate // Prevent endDate < startDate (target >= source)
        : targetDate <= sourceDate; // For 'greater than' operation

    return isValid
      ? null
      : {
          dateCompare: {
            valid: false,
            operation: logic.operation,
            sourceDate: control.value,
            targetDate: logic.compareDate,
          },
        };
  }
}
