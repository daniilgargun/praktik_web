class TiltedCard {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            rotateAmplitude: options.rotateAmplitude || 20,
            scaleOnHover: options.scaleOnHover || 1.15,
            springConfig: {
                damping: 0.15,
                stiffness: 0.25,
                mass: 0.8
            },
            ...options
        };
        
        this.isHovered = false;
        this.currentRotateX = 0;
        this.currentRotateY = 0;
        this.currentScale = 1;
        this.targetRotateX = 0;
        this.targetRotateY = 0;
        this.targetScale = 1;
        this.currentShadowX = 0;
        this.currentShadowY = 0;
        this.targetShadowX = 0;
        this.targetShadowY = 0;
        
        this.init();
    }
    
    init() {
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.transition = 'none';
        this.element.style.cursor = 'pointer';
        
        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        this.animate();
    }
    
    handleMouseMove(e) {
        if (!this.isHovered) return;
        
        const rect = this.element.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;
        
        this.targetRotateX = (offsetY / (rect.height / 2)) * -this.options.rotateAmplitude;
        this.targetRotateY = (offsetX / (rect.width / 2)) * this.options.rotateAmplitude;
        
        // Динамические тени
        this.targetShadowX = (offsetX / (rect.width / 2)) * 15;
        this.targetShadowY = (offsetY / (rect.height / 2)) * 15;
    }
    
    handleMouseEnter() {
        this.isHovered = true;
        this.targetScale = this.options.scaleOnHover;
    }
    
    handleMouseLeave() {
        this.isHovered = false;
        this.targetRotateX = 0;
        this.targetRotateY = 0;
        this.targetScale = 1;
        this.targetShadowX = 0;
        this.targetShadowY = 0;
    }
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    animate() {
        const { stiffness } = this.options.springConfig;
        
        this.currentRotateX = this.lerp(this.currentRotateX, this.targetRotateX, stiffness);
        this.currentRotateY = this.lerp(this.currentRotateY, this.targetRotateY, stiffness);
        this.currentScale = this.lerp(this.currentScale, this.targetScale, stiffness);
        this.currentShadowX = this.lerp(this.currentShadowX, this.targetShadowX, stiffness);
        this.currentShadowY = this.lerp(this.currentShadowY, this.targetShadowY, stiffness);
        
        const shadowBlur = this.isHovered ? 25 : 10;
        const shadowOpacity = this.isHovered ? 0.3 : 0.15;
        
        this.element.style.transform = `
            perspective(1000px) 
            rotateX(${this.currentRotateX}deg) 
            rotateY(${this.currentRotateY}deg) 
            scale(${this.currentScale})
        `;
        
        this.element.style.filter = `
            drop-shadow(${this.currentShadowX}px ${this.currentShadowY + 10}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))
        `;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Инициализация для всех карточек команды
document.addEventListener('DOMContentLoaded', function() {
    const teamCards = document.querySelectorAll('.team-row figure');
    
    teamCards.forEach(card => {
        new TiltedCard(card, {
            rotateAmplitude: 18,
            scaleOnHover: 1.12
        });
    });
}); 