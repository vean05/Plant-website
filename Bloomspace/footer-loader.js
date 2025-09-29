// Footer Loader - Loads consistent footer across all pages
class FooterLoader {
    constructor() {
        this.footerHTML = null;
        this.init();
    }

    async init() {
        try {
            await this.loadFooter();
            this.insertFooter();
        } catch (error) {
            console.error('Failed to load footer:', error);
            this.createFallbackFooter();
        }
    }

    async loadFooter() {
        const response = await fetch('footer.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.footerHTML = await response.text();
    }

    insertFooter() {
        // Remove existing footer if any
        const existingFooter = document.querySelector('.footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        // Insert new footer before closing body tag
        document.body.insertAdjacentHTML('beforeend', this.footerHTML);
        console.log('✅ Footer loaded successfully');
    }

    createFallbackFooter() {
        const fallbackFooter = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>About Us</h3>
                            <ul>
                                <li><a href="#">Our Story</a></li>
                                <li><a href="#">Plant Care Guide</a></li>
                                <li><a href="#">Sustainability</a></li>
                                <li><a href="#">Contact Us</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h3>Customer Service</h3>
                            <ul>
                                <li><a href="#">Shipping Info</a></li>
                                <li><a href="#">Returns & Exchanges</a></li>
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">Size Guide</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h3>Connect With Us</h3>
                            <div class="footer-newsletter">
                                <input type="email" placeholder="Email address">
                                <button type="submit">Subscribe</button>
                            </div>
                            <div class="social-links">
                                <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="copyright">
                            © 2024 Bloomspace. All rights reserved.
                        </div>
                        <div class="footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        // Remove existing footer if any
        const existingFooter = document.querySelector('.footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        // Insert fallback footer
        document.body.insertAdjacentHTML('beforeend', fallbackFooter);
        console.log('✅ Fallback footer loaded');
    }
}

// Initialize footer loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new FooterLoader();
});

