exports.view = `
<div class="container" data='order'>
<div class="row-flex">
    <div class="col-sm-12">
    <button class="accordion order" data="time" style="position: relative;">
    
    Выбрать время
    
    <div data-type="chosen-time" style="position: absolute; right: 40px; bottom: 10px;"></div>
    <div data-type="delete-time" style="position: absolute; right: 10px; bottom: 10px;">X</div>
    </button>
<div>
<form name="month" >
    <select class="month-for-calendar-selector" name="mselect" style="width: 100%; height: 40px; font-size: 1.2rem;">
    <option value="0" selected="true" disabled="disabled">Надо выбрать месяц...</option>
    <option value="1">Январь</option>
    <option value="2">Февраль</option>
    <option value="3">Март</option>
    <option value="4">Апрель</option>
    <option value="5">Май</option>
    <option value="6">Июнь</option>
    <option value="7">Июль</option>
    <option value="8">Август</option>
    <option value="9">Сентябрь</option>
    <option value="10">Октябрь</option>
    <option value="11">Ноябрь</option>
    <option value="12">Декабрь</option>
    </select>
    </form>
    
    <div class="text__text-center">
    <div class="col-sm-12-flex">
    <div id="calendar" data-type="calendar"></div>
    </div>
    <div class="row-flex" data-type="time"></div>
    </div>    
    </div>
    </div>
    </div>

    <div class="row-flex row-flex__column row-flex__y-center">
    <div class="col-sm-12">
    <button class="accordion order" data="service" style="position: relative;">
    
    Выбрать услугу
    
    <div data-type="delete-service" style="position: absolute; right: 10px; bottom: 10px;">X</div>
</button>
<div class ="text__text-center row-flex__x-center services_list" data-content="service">

</div>
</div>
</div>
 <div class="row-flex row-flex__column row-flex__y-center">
    <div class="col-sm-12">
    <button class="accordion order" data-content="by-master" style="position: relative;">
    
    Выбрать мастера
    
    <div data-type="delete-master" style="position: absolute; right: 10px; bottom: 10px;">X</div>
</button>
<div class="master-container text__text-center row-flex__x-center" data-content="master">

    </div>
    </div>
    </div>
<div>
<button class="text__text-center" value="" name="makeOrder" data-type="make_order" style="width: 100%; padding: 10px; background-color: #ea1b75; color: #fff">
    Отправить
    </button>
    </div>
    </div>`;