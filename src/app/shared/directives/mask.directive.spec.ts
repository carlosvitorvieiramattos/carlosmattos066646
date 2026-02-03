import { MaskDirective } from './mask.directive';
import { NgControl } from '@angular/forms';

describe('MaskDirective', () => {
  it('should create an instance', () => {
    // Criamos um mock simples para satisfazer o TypeScript e o Angular
    const mockNgControl = {
      control: {
        valueChanges: { subscribe: () => {} },
        setValue: () => {}
      }
    } as any;

    const directive = new MaskDirective(mockNgControl);
    expect(directive).toBeTruthy();
  });
});