import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseOptions: SweetAlertOptions = {
    heightAuto: false,
    buttonsStyling: false,
    confirmButtonText: 'Ok',
    target: 'body',
    customClass: {
      popup: 'app-swal-popup',
      title: 'app-swal-title',
      htmlContainer: 'app-swal-content',
      confirmButton: 'app-swal-confirm',
      cancelButton: 'app-swal-cancel'
    }
  };

  success(message: string, title: string = 'Sucesso'): Promise<void> {
    return this.fireWithIcon('success', title, message);
  }

  error(message: string, title: string = 'Erro'): Promise<void> {
    return this.fireWithIcon('error', title, message);
  }

  warning(message: string, title: string = 'Atenção'): Promise<void> {
    return this.fireWithIcon('warning', title, message);
  }

  info(message: string, title: string = 'Informação'): Promise<void> {
    return this.fireWithIcon('info', title, message);
  }

  async confirm(
    message: string,
    title: string = 'Confirmar ação',
    confirmButtonText: string = 'Confirmar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      ...this.baseOptions,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText,
      cancelButtonText
    });

    return result.isConfirmed;
  }

  private async fireWithIcon(icon: SweetAlertIcon, title: string, message: string): Promise<void> {
    await Swal.fire({
      ...this.baseOptions,
      icon,
      title,
      text: message
    });
  }
}