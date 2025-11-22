import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ValidatorsService } from '../services/validador.service';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {
  @Input() appMask: 'cpf' | 'cnpj' | 'phone' | 'cep' | '' = '';

  constructor(
    private el: ElementRef,
    private control: NgControl,
    private validatorsService: ValidatorsService
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    let value = event.target.value;
    let maskedValue = '';

    switch (this.appMask) {
      case 'cpf':
        maskedValue = this.validatorsService.maskCpf(value);
        break;
      case 'cnpj':
        maskedValue = this.validatorsService.maskCnpj(value);
        break;
      case 'phone':
        maskedValue = this.validatorsService.maskPhone(value);
        break;
      case 'cep':
        maskedValue = this.validatorsService.maskCep(value);
        break;
      default:
        maskedValue = value;
    }

    if (maskedValue !== value) {
      event.target.value = maskedValue;
      
      // Atualiza o valor do FormControl sem a máscara
      if (this.control && this.control.control) {
        const unmaskedValue = this.validatorsService.removeMask(maskedValue);
        this.control.control.setValue(unmaskedValue, { emitEvent: false });
      }
    }
  }

  @HostListener('blur')
  onBlur(): void {
    // Quando o campo perde o foco, garante que a máscara esteja aplicada
    if (this.control && this.control.control) {
      const value = this.control.control.value;
      if (value) {
        let maskedValue = '';
        
        switch (this.appMask) {
          case 'cpf':
            maskedValue = this.validatorsService.maskCpf(value);
            break;
          case 'cnpj':
            maskedValue = this.validatorsService.maskCnpj(value);
            break;
          case 'phone':
            maskedValue = this.validatorsService.maskPhone(value);
            break;
          case 'cep':
            maskedValue = this.validatorsService.maskCep(value);
            break;
        }
        
        this.el.nativeElement.value = maskedValue;
      }
    }
  }
}