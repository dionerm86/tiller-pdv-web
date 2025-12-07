import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/model/cliente.model';

@Component({
  selector: 'app-selecionar-cliente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule
  ],
  templateUrl: '../selecionar-cliente-dialog/selecionar-cliente-dialog.component.html',
  styleUrls: ['../selecionar-cliente-dialog/selecionar-cliente-dialog.component.scss']
})
export class SelecionarClienteDialogComponent implements OnInit {
  searchControl = new FormControl('');
  clientes: Cliente[] = [];
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<SelecionarClienteDialogComponent>,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    // Configura a busca reativa (espera 300ms antes de buscar)
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(termo => {
        if (!termo || termo.length < 2) {
          return of([]);
        }
        return this.clienteService.search(termo).pipe(
            finalize(() => this.loading = false)
        );
      })
    ).subscribe({
      next: (res) => {
        this.clientes = res;
        this.loading = false; // Garante que loading pare mesmo se vier vazio
      },
      error: () => this.loading = false
    });
  }

  selecionar(cliente: Cliente | null): void {
    this.dialogRef.close(cliente);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}