class NewsArranger{constructor(isMobile){this.isMobile=isMobile,this.cards=this.getCards()}arrange(callback){this.isMobile&&(this.swiperWrapper=document.querySelector("#news-carousel .swiper-wrapper"),this.removeCards(),this.swiperWrapper.innerHTML="",this.putCards(this.swiperWrapper)),callback()}getCards(){return[].flat.call(document.querySelectorAll(".news-card"))}removeCards(){this.cards.forEach(card=>{card.parentNode.removeChild(card)})}putCards(slideContainer){this.cards.map(card=>{const slide=document.createElement("div");return slide.className="col-4 col-md col-bottom swiper-slide",slide.appendChild(card),slide}).forEach(slide=>slideContainer.appendChild(slide))}}