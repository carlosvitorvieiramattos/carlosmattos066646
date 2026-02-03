import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {
  @Input('appMask') maskType: 'cpf' | 'tel' = 'cpf';

  constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (this.maskType === 'cpf') {
      value = value.substring(0, 11); // Limita a 11 dígitos
      
      // Aplica os pontos e o traço progressivamente
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      }
    } 
    else if (this.maskType === 'tel') {
      value = value.substring(0, 11); // Limita a 11 dígitos (celular)
      
      if (value.length > 10) {
        // Celular: (99) 99999-9999
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (value.length > 6) {
        // Fixo ou parcial: (99) 9999-9999
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 2) {
        // DDD: (99) 9...
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else if (value.length > 0) {
        // Apenas DDD: (99
        value = value.replace(/^(\d*)/, "($1");
      }
    }

    // Atualiza o valor no formulário sem disparar um loop infinito de eventos
    this.control.control?.setValue(value, { emitEvent: false });
  }
}