document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    const nextImgBtn = document.querySelector('.nextImage');
    const nextQuoteBtn = document.querySelector('.nextQuote');
    const quoteBlock = document.querySelector('.quoteBlock');
    const quoteText = document.querySelector('.quoteText');
    const quoteAuthor = document.querySelector('.quoteAuthor');
    const greeting = document.querySelector('.greeting');
    const focus = document.querySelector('.focus');
    const clock = document.querySelector('.clock');
    const date = document.querySelector('.date');
    const city = document.querySelector('.city');
    const weatherIcon = document.querySelector('.weatherIcon');
    const temperature = document.querySelector('.temperature');
    const weatherDescription = document.querySelector('.weatherDescription');
    const windSpeed = document.querySelector('.windSpeed');
    const humidity = document.querySelector('.humidity');
    const greetingTemplate = ['Good night', 'Good morning', 'Good day', 'Good evening'];
    const timePeriods = ['night', 'morning', 'afternoon', 'evening'];
    const imagePath = './assets/images';
    const limitImages = 10;
    const imageArray = [];
    let slideCounter = 0; 
    let currentHour;   

    function updateTime() {
        let currentDate = new Date();    

        if (currentHour !== currentDate.getHours()) {
            currentHour = currentDate.getHours();
            slideCounter = currentHour;
            nextImage();   
            updateGreeting(currentDate);                  
        }                        
        
        showDate(currentDate);   
        showTime(currentDate);       

        setTimeout(updateTime, 1000);
    }

    function showTime(currentDate) {
        clock.textContent = currentDate.toLocaleTimeString("ru-RU");
    }

    function showDate(currentDate) {
        date.textContent = currentDate.toLocaleString('default', {weekday: 'long', day: 'numeric', month: 'long' });
    }

    function updateGreeting(cDate) {
        greeting.textContent = `${greetingTemplate[ (cDate.getHours - cDate.getHours % 6) / 6 ]}, ${localStorage.getItem('name')}.`;
    }

    function updateImage(src) {        
        const img = document.createElement('img');
        img.src = src;
        img.onload = () => body.style.backgroundImage = `url(${src})`;
    }

    function nextImage() {        
        const imageIndex = slideCounter % 6;
        const periodIndex = (slideCounter - imageIndex) / 6;        
        const imgSrc = `${imagePath}/${timePeriods[periodIndex]}/${imageArray[periodIndex][imageIndex].toString().padStart(2, '0')}.jpg`;
        updateImage(imgSrc);
        slideCounter = slideCounter === 23 ? 0 : slideCounter + 1;
        nextImgBtn.disabled = true;             
    } 

    async function getQuote() {        
        try {
            let url = 'https://type.fit/api/quotes';
            const response = await fetch(url);
            const json = await response.json();
            const num = Math.floor(Math.random() * json.length);
            const author = json[num].author === null ? 'Noname' : json[num].author;            
            quoteText.innerText = '“' + json[num].text + '”';            
            quoteAuthor.innerHTML = '&mdash;&nbsp;' + author;                                                                
        } catch (e) {
            console.error(e);
            console.error('Cann\'t to get a quotes');
        }
    }

    async function getWeather() {        
        try {            
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${localStorage.getItem('city')}&lang=en&appid=8e2156ebb55de616dba49213a3f6e621&units=metric`;
            const response = await fetch(url);
            const json = await response.json();
            const errBlock = document.querySelector('.weatherError');
            const weatherMetrics = document.querySelector('.weatherMetrics');

            if (response.status === 200) {                                               
                weatherIcon.className = 'weatherIcon owf';
                weatherIcon.classList.add(`owf-${json.weather[0].id}`);
                temperature.textContent = `${json.main.temp}°C`;
                weatherDescription.textContent = json.weather[0].description;
                windSpeed.textContent = json.wind.speed + ' m/s';
                humidity.textContent = json.main.humidity + '% humidity';            
                errBlock.classList.remove('weatherError_show');   
                weatherMetrics.classList.remove('weatherMetrics_none');             
                weatherMetrics.classList.remove('city_text_hide');
                localStorage.setItem('city', json.name); 
            } else {                
                errBlock.textContent = json.message;
                weatherMetrics.classList.add('weatherMetrics_none');
                
                if (localStorage.getItem('city') !== null)
                    errBlock.classList.add('weatherError_show');   
                
                weatherMetrics.classList.add('city_text_hide');             
            }
        } catch (e) {
            console.error(e);
            console.error('Can not to get a weather info');
        }
    }

    /* Weather City Block */

    function editCity() {
        const cityText = document.querySelector('.cityText');
        cityText.classList.remove('city_text_hide');
        city.textContent = '';
        city.classList.add('city_empty');
        const weatherMetrics = document.querySelector('.weatherMetrics');
        weatherMetrics.classList.add('weather_hide');
        weatherIcon.classList.add('weather_hide');
        const weatherErr = document.querySelector('.weatherError');
        weatherErr.classList.remove('weatherError_show');
    }

    function hideCityText() {
        const cityText = document.querySelector('.cityText');
        cityText.classList.add('city_text_hide');        
        city.classList.remove('city_empty');
    }
    
    function cityEndTransition(e) {
        if (e.target.className.includes('city_hide')) {
            if (localStorage.getItem('city') !== null)
                city.textContent = localStorage.getItem('city');
            else {
                city.classList.add('city_empty');
                const cityText = document.querySelector('.cityText');
                cityText.classList.remove('city_text_hide');
            }

            city.classList.remove('city_hide');
            const weatherMetrics = document.querySelector('.weatherMetrics');
            weatherMetrics.classList.remove('weather_hide');
            weatherIcon.classList.remove('weather_hide');
        }
    }

    function setCity(e) {
        if (e.which == 13 || e.keyCode == 13 || e.type == 'blur') { 
            city.blur();

            if (city.textContent === '' || (!city.textContent.replace(/\s/g, '').length)) {
                hideCityText();              
                city.classList.add('city_hide');                    
            } else {                
                hideCityText();                
                localStorage.setItem('city', e.target.innerText);                
                city.classList.add('city_hide');
            } 
            
            getWeather();
        }
    }

    city.addEventListener('click', editCity);
    city.addEventListener('blur', setCity);
    city.addEventListener('keypress', setCity);
    city.addEventListener('transitionend', cityEndTransition);

    /* Hello Block */
    
    function editGreeting() {
        const hello = document.querySelector('.hello_text');
        hello.classList.remove('hello_text_hide');
        greeting.textContent = '';
        greeting.classList.add('greeting_empty');
    }

    function hideHelloText() {
        const hello = document.querySelector('.hello_text');
        hello.classList.add('hello_text_hide');
        greeting.classList.remove('greeting_empty');
    }
    
    function greetingEndTransition(e) {
        if (e.target.className.includes('greeting_hide')) {
            if (localStorage.getItem('name') !== null) {
                const idx = (currentHour - currentHour % 6) / 6;
                greeting.textContent = `${greetingTemplate[idx]}, ${localStorage.getItem('name')}.`;
            } else {
                greeting.classList.add('greeting_empty');
                const hello = document.querySelector('.hello_text');
                hello.classList.remove('hello_text_hide');
            }

            greeting.classList.remove('greeting_hide');
        }
    }

    function setName(e) {
        if (e.which == 13 || e.keyCode == 13 || e.type == 'blur') { 
            greeting.blur();

            if (greeting.textContent === '' || (!greeting.textContent.replace(/\s/g, '').length)) {
                hideHelloText();              
                greeting.classList.add('greeting_hide');                    
            } else {                
                hideHelloText();                
                localStorage.setItem('name', e.target.innerText);                
                greeting.classList.add('greeting_hide');
            }            
        }
    }

    greeting.addEventListener('click', editGreeting);
    greeting.addEventListener('blur', setName);
    greeting.addEventListener('keypress', setName);
    greeting.addEventListener('transitionend', greetingEndTransition);

    function editFocus() {
        const whatsFocus = document.querySelector('.focusText');
        whatsFocus.classList.remove('focus_text_hide');
        focus.textContent = '';
        focus.classList.add('focus_empty');
    }

    function hideFocusText() {
        const whatsFocus = document.querySelector('.focusText');
        whatsFocus.classList.add('focus_text_hide');
        focus.classList.remove('focus_empty');
    }
    
    function focusEndTransition(e) {
        if (e.target.className.includes('focus_hide')) {
            if (localStorage.getItem('focus') !== null)
                focus.textContent = localStorage.getItem('focus');
            else {
                focus.classList.add('focus_empty');
                const whatsFocus = document.querySelector('.focusText');
                whatsFocus.classList.remove('focus_text_hide');
            }

            focus.classList.remove('focus_hide');
        }
    }

    function setFocus(e) {
        if (e.which == 13 || e.keyCode == 13 || e.type == 'blur') { 
            focus.blur();

            if (focus.textContent === '' || (!focus.textContent.replace(/\s/g, '').length)) {
                hideFocusText();                  
                focus.classList.add('focus_hide');                    
            } else {                
                hideFocusText();                
                localStorage.setItem('focus', e.target.innerText);                
                focus.classList.add('focus_hide');
            }            
        }
    }

    focus.addEventListener('click', editFocus);
    focus.addEventListener('blur', setFocus);
    focus.addEventListener('keypress', setFocus);
    focus.addEventListener('transitionend', focusEndTransition);

    quoteText.addEventListener('transitionend', e => {
        if (e.target.className.includes('quoteTextHide')) {
            quoteBlock.classList.remove('quoteBlockNext');          
        }        
    });

    quoteBlock.addEventListener('transitionend', e => {
        if (e.target.className.includes('quoteBlock')) {
            if (e.target.className.includes('quoteBlockNext')) {
                showQuoteText();
            } else {
                getQuote();                        
                setTimeout(() => {
                    quoteBlock.classList.add('quoteBlockNext');
                }, 1000);
            }                    
        }
    });

    function hideQuoteText() {
        quoteText.classList.add('quoteTextHide');
        quoteAuthor.classList.add('quoteTextHide');
    }

    function showQuoteText() {
        quoteText.classList.remove('quoteTextHide');
        quoteAuthor.classList.remove('quoteTextHide');
    }

    function nextQuote() {
        hideQuoteText();
    }

    function bodyEndTransition() {
        nextImgBtn.disabled = false;
    }

    function shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    }

    function init() {        
        for (let i = 0; i < 4; i++) {
            imageArray[i] = [];
            imageArray[i].push(...shuffle(Array.from(Array(limitImages).keys())));
        }

        currentHour = new Date().getHours();
        slideCounter = currentHour;

        nextImage();

        if (localStorage.getItem('city') !== null) {
            hideCityText();            
            city.textContent = localStorage.getItem('city');
        }

        if (localStorage.getItem('name') !== null) {
            hideHelloText();            
            const idx = (currentHour - currentHour % 6) / 6;
            greeting.textContent = `${greetingTemplate[idx]}, ${localStorage.getItem('name')}.`;
        }

        if (localStorage.getItem('focus') !== null) {
            hideFocusText();            
            focus.textContent = localStorage.getItem('focus');
        }

        getQuote();
        quoteBlock.classList.add('quoteBlockNext');

        getWeather();        

        updateTime();
        
        nextImgBtn.disabled = false;
    }
    
    init();

    nextImgBtn.addEventListener('click', nextImage);
    nextQuoteBtn.addEventListener('click', nextQuote);
    body.addEventListener('transitionend', bodyEndTransition);
});
