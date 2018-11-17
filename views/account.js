exports.view = `<div class="container">
                    <div class="row-flex row-flex__x-center">
                        <div class="col-sm-12-flex text__text-center">
                            <h1>Личный кабинет</h1>
                         </div>
                            <div class="container">
                                        <div class="row-flex">
                                            <div class="col-sm-4-flex">
                                                <img src="assets/users/<%this.photo%>">
                                            </div>
                                            <div class="col-sm-8-flex">
                                                <div>Логин: <%this.login%></div>
                                                <div>Телефон: <%this.phone%></div>
                                                <div>Почта: <%this.email%></div>
                                            </div>
                                        </div>
                        </div>
                      <div class="btn btn__danger" data-type="exit" onclick="onNavItemClick('/'); return false;">Выход</div>
                    </div>
                </div>`;