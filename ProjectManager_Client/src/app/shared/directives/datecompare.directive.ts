import {
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Directive, Input } from '@angular/core';

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
  @Input() compareDate!: string | Date; // Accepts string or Date
  @Input() operation!: 'less than' | 'greater than'; // Comparison operation

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.compareDate || !this.operation || !control.value) {
      return null;
    }

    // Convert values to Date objects if needed
    const sourceDate =
      control.value instanceof Date ? control.value : new Date(control.value);
    const targetDate =
      this.compareDate instanceof Date
        ? this.compareDate
        : new Date(this.compareDate);

    // If either date is invalid, skip validation
    if (isNaN(sourceDate.getTime()) || isNaN(targetDate.getTime())) {
      return null;
    }

    const isValid =
      this.operation === 'less than'
        ? sourceDate < targetDate
        : sourceDate > targetDate;

    return isValid
      ? null
      : {
          dateCompare: {
            valid: false,
            operation: this.operation,
            sourceDate: control.value,
            targetDate: this.compareDate,
          },
        };
  }
}
