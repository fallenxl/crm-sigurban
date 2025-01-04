import Swal from 'sweetalert2';

export const successAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Ok',
  });
};

export const errorAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Ok',
  });
};

export const warningAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'Ok',
  });
};

export const infoAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'Ok',
  });
};

export const questionAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    confirmButtonText: 'Ok',
  });
};


export const successAlertWithTimer = (title: string, text: string, timer: number = 3000) => {
  Swal.fire({
    title,
    text,
    icon: 'success',
    showConfirmButton: false,
    timer,
  });
}

export const errorAlertWithTimer = (title: string, text: string, timer: number = 3000) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    showConfirmButton: false,

    timer,

  });
}

export const successAlertWithRedirect = (title: string, text: string, url: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Ok',
  }).then((result) => {
    if (result.isConfirmed) {
      window.document.location = url;
    }
  }
  );
};