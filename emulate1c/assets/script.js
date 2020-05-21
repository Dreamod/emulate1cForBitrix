$(function(){

    let alert   =   $('.jsAlert'),
        log     =   alert.find('.log'),
        bWrap   =   $('.jsImportButtonsWrap'),
        body    =   $('.jsBody'),
        content =   $('.jsContent'),
        footer  =   $('.jsFooter'),
        copy    =   $('.jsCopy'),
        timerId,
        titleTimerId;

    setContentMinHeight();
    setCopyrightWidth();

    $(window).resize(function(){
        setContentMinHeight();
        setCopyrightWidth();
    });

    /**
     * слушаем клики по импортам
     */
    $(document).on('click','.jsImport',function(e){
        let button  =   $(this),
            fileName=   button.attr('data-file'),
            fileType=   button.attr('data-type'),
            path    =   button.closest('.jsImportButtonsWrap').attr('data-action'),
            token   =   '';
        stopTimer();
        startTimer();
        e.preventDefault();
        clearImportLog();
        restartAllButtons();
        setImportLogTitle('Импорт файла '+fileName);
        triggerButtonStatus(button,'process');
        clearFocus();
        addImportLogRow('Начинаю импорт');
        addImportLogRow('Получаю токен');
        alert.show();
        token   =   getToken(button);
        if(token!==""){
            addImportLogRow('Токен получен');
            $.ajax({
                type:       'GET',
                url:        path,
                data:       {fileName:fileName},
                cache:      false,
                dataType:   'json',
                success:    function(data){
                    if(data.status==='ok'){
                        runImport(data.import,token);
                    }else{
                        stopTimer('- Error');
                        addImportLogRow('Ошибка при копировании файла '+fileName);
                        addImportLogRow('error Импорт прерван из-за ошибки.');
                        triggerImportLogStatus('danger');
                        alert.show();
                        triggerButtonStatus(button,'error');
                    }
                }
            });
        }else{
            stopTimer('- Error');
            addImportLogRow('Токен не получен');
            addImportLogRow('error Импорт прерван из-за ошибки.');
            triggerImportLogStatus('danger');
            triggerButtonStatus(button,'error');
        }
    });

    /**
     * получает токен
     * @param button
     * @returns {string}
     */
    function getToken(button){
        let token   =   '';
        $.ajax({
            type:       'GET',
            url:        '/bitrix/admin/1c_exchange.php?type=sale&mode=checkauth',
            cache:      false,
            dataType:   'html',
            async:      false,
            success:    function(data){
                if(data.indexOf('Авторизация')>1){
                    stopTimer('- Error');
                    addImportLogRow('Проблема с авторизацией!');
                    addImportLogRow('Необходимо авторизоваться под пользователем имеющим право на обмен с 1С.');
                    addImportLogRow('error Импорт прерван из-за ошибки.');
                    triggerImportLogStatus('danger');
                    triggerButtonStatus(button,'error');
                }else{
                    token   =   data.replace(/success\nPHPSESSID\n.+\nsessid=/gmi,'');
                }
            }
        });
        return  token;
    }

    /**
     * отправляет запросы импорта на сервер
     * @param fileName
     * @param token
     */
    function runImport(fileName,token){
        let button  =   bWrap.find('.jsImport[data-file="'+fileName+'"]');
        $.ajax({
            type:       'GET',
            url:        '/bitrix/admin/1c_exchange.php?type=catalog&mode=import&filename='+fileName+'&sessid='+token+'&version=2.08',
            cache:      false,
            dataType:   'html',
            success:    function(data){
                if(data.indexOf('Авторизация')>1){
                    stopTimer('- Error');
                    addImportLogRow('Проблема с авторизацией!');
                    addImportLogRow('Необходимо авторизоваться под пользователем имеющим право на обмен с 1С.');
                    addImportLogRow('error Импорт прерван из-за ошибки.');
                    triggerImportLogStatus('danger');
                    triggerButtonStatus(button,'error');
                }else if(data.indexOf('Импорт успешно завершен')<1){
                    addImportLogRow(data);
                    setTimeout(function(){
                        runImport(fileName,token);
                    },500);
                }else{
                    stopTimer('+ Finish');
                    addImportLogRow(data);
                    triggerButtonStatus(button,'finish');
                }
            }
        });
    }

    /**
     * меняет статус кнопки
     * @param button
     * @param status
     */
    function triggerButtonStatus(button,status){
        if(status==='finish'){
            restartAllButtons();
            button.addClass('btn-outline-success').removeClass('btn-outline-info').prepend('<span class="jsIcon mr5"><i class="fa fa-check"></i></span>');
        }
        if(status==='process'){
            restartAllButtons();
            button.addClass('btn-success').removeClass('btn-outline-info').prepend('<span class="jsSpinner spinner-border spinner-border-sm mr5" role="status" aria-hidden="true"></span>');
        }
        if(status==='error'){
            restartAllButtons();
            button.addClass('btn-outline-danger').removeClass('btn-outline-info').prepend('<span class="jsError mr5"><i class="fa fa-exclamation-triangle"></i></span>');
        }
    }

    /**
     * сбрасывает стиль кнопок в дефолтное состояние
     */
    function restartAllButtons(){
        bWrap.find('.jsImport').removeClassWild('btn-*');
        bWrap.find('.jsImport').addClass('btn-outline-info');
        bWrap.find('.jsImport').find('.jsSpinner').remove();
        bWrap.find('.jsImport').find('.jsIcon').remove();
        bWrap.find('.jsImport').find('.jsError').remove();
    }

    /**
     * устанавливает заголовок лога
     * @param title
     */
    function setImportLogTitle(title=''){
        alert.find('.jsAlertTitle').text(title);
    }

    /**
     * добавляет строку в лог
     * @param rowText
     */
    function addImportLogRow(rowText){
        log.append('<li>'+rowText+'</li>');
    }

    /**
     * очищает лог
     */
    function clearImportLog(){
        alert.hide();
        setImportLogTitle();
        triggerImportLogStatus();
        log.html('');
    }

    /**
     * меняет статус лога
     * @param status
     */
    function triggerImportLogStatus(status='info'){
        alert.addClass('alert-'+status);
        alert.removeClassWild('alert-*');
        alert.addClass('alert-'+status);
    }

    /**
     * снимает фокус с кнопки
     */
    function clearFocus(){
        if(!$('.jsFocus').length){
            body.append('<a href="#" class="jsFocus focusItem">');
        }
        body.find('.jsFocus').focus();
    }

    /**
     * устанавливает минимальную высоту контента
     */
    function setContentMinHeight(){
        let h   =   footer.innerHeight();
        content.css('min-height','calc(100vh - '+h+'px)');
    }

    /**
     * устанавливает параметры отступов копирайта
     */
    function setCopyrightWidth(){
        let h   =   footer.innerHeight();
        copy.css({'width':h,'bottom':((h/2)-10),'right':((h/2)-15)*-1});
    }

    /**
     * обновляет тайтл страницы
     * @param text
     */
    function updateTitle(text){
        document.title  =   text;
    }

    /**
     * останавливает таймер
     * @param text
     */
    function stopTimer(text=''){
        let timerWrap   =   $('.jsTimerWrap'),
            timer       =   timerWrap.find('.jsTimer'),
            tmpTimer    =   timer.clone();
        timer.remove();
        timerWrap.append(tmpTimer);
        clearInterval(timerId);
        clearInterval(titleTimerId);
        if(text){
            updateTitle(text);
        }
    }

    /**
     * запускает таймер
     */
    function startTimer(){
        let s   =   '01',
            m   =   '00',
            h   =   '00',
            d   =   1,
            hour=   document.querySelector('.jsHour'),
            min =   document.querySelector('.jsMin'),
            sec =   document.querySelector('.jsSec');
        sec.innerText   =   s;
        min.innerText   =   m;
        hour.innerText  =   h;
        timerId =   setInterval(function(){
            s   =   +s+1;
            if(s<10){s='0'+s;}
            if(s===60){
                s='00';
                m=+m+1;
                if(m<10){m='0'+m;}
                if(m===60){
                    m='00';
                    h=+h+1;
                    if(h<10){h='0'+h;}
                }
            }
            sec.innerText   =   s;
            min.innerText   =   m;
            hour.innerText  =   h;
        },1000);
        titleTimerId=   setInterval(function(){
            if(d===1){
                updateTitle('>');
            }else{
                updateTitle('>'+document.title);
            }
            d++;
            if(d===7){d=1;}
        },500);
    }

    /**
     * расширяет возможности jQuery
     * дает возможность удаления классов по маске
     * @param mask
     * @returns {*}
     */
    $.fn.removeClassWild=   function(mask){
        return this.removeClass(function(index,cls){
            let re  = mask.replace(/\*/g,'\\S+');
            return  (cls.match(new RegExp('\\b'+re+'','g'))||[]).join(' ');
        });
    };
});