class NewsArranger {
    constructor( isMobile, callback  ){

        this.isMobile = isMobile;

        /// se siamo su un device mobile        
        if( this.isMobile ) {

            /// prendiamo lo swiperswapper
            this.swiperWrapper = document.querySelector('#news-carousel .swiper-wrapper');
            
            ///  cards è un array di elementi (cards)
            this.cards = this.getCards();

            /// rimuoviamo tutte le cards delle news
            this.removeCards();

            /// vuotiamo il wrapper
            this.swiperWrapper.innerHTML = '';

            /// e ci mettiamo tutte le news in ordine
            this.putCards( this.swiperWrapper );
        }
        
        /// eseguiamo comunque una callback;
        callback();
    }

    getCards() {   
        return [].flat.call(document.querySelectorAll('.news-card'));
    }

    removeCards() {
        this.cards.forEach( card => { card.parentNode.removeChild( card ); });
    }

    putCards( slideContainer ) {

        /// creiamo tutte le slide
        let slides = this.cards.map( card => {

            /// creiamo una slide
            const slide = document.createElement('div');
            slide.className = "col-4 col-md col-bottom swiper-slide";

            /// ci mettiamo dentro la card
            slide.appendChild(card);
        
            return slide;
        });

        /// e le piazziamo nel contenitore
        slides.forEach( slide => slideContainer.appendChild( slide ) );

    }
}

