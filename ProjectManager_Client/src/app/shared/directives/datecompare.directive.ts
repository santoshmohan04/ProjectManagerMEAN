import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { Directive, Input } from '@angular/core';
import moment from 'moment';

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
  @Input() compareDate!: string; // Date to compare against
  @Input() operation!: 'less than' | 'greater than'; // Comparison operation

  validate(control: AbstractControl): ValidationErrors | null {
    // Validate inputs
    if (!this.compareDate || !this.operation || !control.value) {
      return null;
    }

    const sourceDate = moment(control.value).toDate();
    const targetDate = moment(this.compareDate).toDate();

    // Check the comparison
    const isValid = this.operation === 'less than' 
      ? sourceDate < targetDate 
      : sourceDate > targetDate;

    // Return validation errors if the comparison fails
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