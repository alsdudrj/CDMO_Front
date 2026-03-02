from playwright.sync_api import sync_playwright
import time

def verify_deviation_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # Check Deviation Chart
            print("Navigating to /dashboard...")
            page.goto("http://localhost:3000/dashboard")
            page.wait_for_selector("h5:has-text('Deviation Status')", timeout=30000)
            time.sleep(2)
            page.screenshot(path="verification_deviation_chart.png")

            # Go to Deviations page
            print("Navigating to /deviations...")
            page.goto("http://localhost:3000/deviations")
            page.wait_for_selector("h2:has-text('Deviation Status')", timeout=10000)
            print("Waiting for data polling...")
            time.sleep(2)

            # Check for table rows
            rows = page.locator("tbody tr")
            if rows.count() > 0:
                print("Opening AI Analysis modal...")
                first_btn = page.locator("button:has-text('AI Analysis')").first
                if first_btn.is_visible():
                    first_btn.click()
                    page.wait_for_selector(".modal-content", timeout=5000)
                    time.sleep(3) # Wait for Korean AI response
                    print("Taking screenshot of Korean Modal...")
                    page.screenshot(path="verification_ai_modal_kr.png")
            else:
                print("No deviation rows found.")

            print("Verification script finished.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_deviation_ui()
