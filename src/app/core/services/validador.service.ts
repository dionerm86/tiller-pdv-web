import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  // Validador de CPF
  cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cpf = control.value?.replace(/\D/g, '');
      
      if (!cpf) {
        return null; // Se estiver vazio, deixa o required validar
      }

      if (cpf.length !== 11) {
        return { cpfInvalido: true };
      }

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) {
        return { cpfInvalido: true };
      }

      // Validação do primeiro dígito verificador
      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let resto = 11 - (soma % 11);
      let digito1 = resto >= 10 ? 0 : resto;

      if (digito1 !== parseInt(cpf.charAt(9))) {
        return { cpfInvalido: true };
      }

      // Validação do segundo dígito verificador
      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
      }
      resto = 11 - (soma % 11);
      let digito2 = resto >= 10 ? 0 : resto;

      if (digito2 !== parseInt(cpf.charAt(10))) {
        return { cpfInvalido: true };
      }

      return null;
    };
  }

  // Validador de CNPJ
  cnpjValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cnpj = control.value?.replace(/\D/g, '');
      
      if (!cnpj) {
        return null;
      }

      if (cnpj.length !== 14) {
        return { cnpjInvalido: true };
      }

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(cnpj)) {
        return { cnpjInvalido: true };
      }

      // Validação do primeiro dígito verificador
      let tamanho = cnpj.length - 2;
      let numeros = cnpj.substring(0, tamanho);
      let digitos = cnpj.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0))) {
        return { cnpjInvalido: true };
      }

      // Validação do segundo dígito verificador
      tamanho = tamanho + 1;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(1))) {
        return { cnpjInvalido: true };
      }

      return null;
    };
  }

  // Validador de CPF ou CNPJ
  cpfCnpjValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.replace(/\D/g, '');
      
      if (!value) {
        return null;
      }

      if (value.length === 11) {
        return this.cpfValidator()(control);
      } else if (value.length === 14) {
        return this.cnpjValidator()(control);
      }

      return { cpfCnpjInvalido: true };
    };
  }

  // Aplica máscara de CPF
  maskCpf(value: string): string {
    if (!value) return '';
    
    value = value.replace(/\D/g, '');
    value = value.substring(0, 11);
    
    if (value.length <= 3) {
      return value;
    } else if (value.length <= 6) {
      return value.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (value.length <= 9) {
      return value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  }

  // Aplica máscara de CNPJ
  maskCnpj(value: string): string {
    if (!value) return '';
    
    value = value.replace(/\D/g, '');
    value = value.substring(0, 14);
    
    if (value.length <= 2) {
      return value;
    } else if (value.length <= 5) {
      return value.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (value.length <= 8) {
      return value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length <= 12) {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    }
  }

  // Aplica máscara de telefone
  maskPhone(value: string): string {
    if (!value) return '';
    
    value = value.replace(/\D/g, '');
    value = value.substring(0, 11);
    
    if (value.length <= 2) {
      return value;
    } else if (value.length <= 6) {
      return value.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (value.length <= 10) {
      return value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else {
      return value.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    }
  }

  // Aplica máscara de CEP
  maskCep(value: string): string {
    if (!value) return '';
    
    value = value.replace(/\D/g, '');
    value = value.substring(0, 8);
    
    if (value.length <= 5) {
      return value;
    } else {
      return value.replace(/(\d{5})(\d+)/, '$1-$2');
    }
  }

  // Remove máscara (mantém apenas números)
  removeMask(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }
}