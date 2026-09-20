
class MenuMobile {

    constructor() {
        this.hamburger = document.getElementById('hamburger--icon');
        this.menu      = document.getElementById('menu_mobile');

        this.is_open = false;

        this.toggle = this.toggle.bind(this);
        this.hamburger.addEventListener( 'click', this.toggle );
    }

    toggle() {

        if( this.is_open )

            this.close();
        else
            this.open();
    }

    open() {

        this.hamburger.classList.add('open');
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.hamburger.setAttribute('aria-label', 'Chiudi il menu');
        this.menu.classList.add('open');
        document.body.classList.add('menu-open');
        this.is_open = true;
    }

    close() {

        this.hamburger.classList.remove('open');
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.hamburger.setAttribute('aria-label', 'Apri il menu');
        this.menu.classList.remove('open');
        document.body.classList.remove('menu-open');
        this.is_open = false;
    }

    
    
      
    

}

function initMenuMobile() {
    const hamburger = document.getElementById('hamburger--icon');
    const menu = document.getElementById('menu_mobile');

    if (hamburger && menu) new MenuMobile();
}

if (document.readyState === 'loading')
    window.addEventListener('DOMContentLoaded', initMenuMobile);
else
    initMenuMobile();
