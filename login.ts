const form = document.getElementById('login-form') as HTMLFormElement;
const userInput = document.getElementById('user-input') as HTMLInputElement;
const passInput = document.getElementById('pass-input') as HTMLInputElement;
const errorMsg = document.getElementById('error-msg') as HTMLParagraphElement;

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = userInput.value;
    const pass = passInput.value;

    if (user.toLowerCase() === 'admin' && pass === 'admin') {
      window.location.href = '/settings.html';
    } else {
      if (errorMsg) {
        errorMsg.classList.remove('hidden');
        setTimeout(() => {
          errorMsg.classList.add('hidden');
        }, 2000);
      }
    }
  });
}
export {};
