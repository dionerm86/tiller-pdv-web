import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Venda } from '../../../core/model/venda.model';

@Component({
  selector: 'app-cancelar-venda-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './cancelar-venda-dialog.component.html',
  styleUrls: ['./cancelar-venda-dialog.component.css']
})
export class CancelarVendaDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CancelarVendaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public venda: Venda
  ) {
    this.form = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.motivo);
    }
  }
}