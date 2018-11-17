exports.view = `
<div class="container">
    <div class="row-flex row-flex__x-center">
        <div class="container_f">
          <div class="message signup">
            <div class="btn-wrapper">
              <button class="button" id="signup">Регистрация</button>
              <button class="button" id="login"> Вход</button>
            </div>
          </div>
          <div class="form form--signup">
            <div class="form--heading">Регистрация</div>
            <form autocomplete="off">
              <input type="text" data-content="login" placeholder="Логин" required>
              <input type="email" data-content="email" placeholder="Почта" required>
              <input type="phone" data-content="phone" placeholder="Телефон">
              <input type="password" data-content="password" placeholder="Пароль" required>
              <div class="button" data-type="register">Регистрация</div>
            </form>
          </div>
          <div class="form form--login">
            <div class="form--heading">Вход</div>
            <form autocomplete="off">
              <input type="text" data-content="login_l" placeholder="Логин">
              <input type="password" data-content="password_l" placeholder="Пароль">
              <div class="button" data-type="login">Вход</div>
            </form>
          </div>
        </div>
    </div>
</div>`;