from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# 1️⃣ Path to your chromedriver
service = Service("/Users/apple/drivers/chromedriver")
driver = webdriver.Chrome(service=service)

# 2️⃣ Open your SmartDocQ login page
driver.get("http://localhost:5173/login")
driver.maximize_window()

try:
    wait = WebDriverWait(driver, 10)

    # 3️⃣ Wait for fields to appear
    email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
    password_field = driver.find_element(By.ID, "password")

    # 4️⃣ Wait for the login button using its class or type
    login_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.login-btn"))
    )

    print("✅ Login page elements loaded successfully!")

    # 5️⃣ Enter test credentials
    email_field.send_keys("b@gmail.com")
    password_field.send_keys("1234")

    # 6️⃣ Click the login button
    login_btn.click()
    print("🖱️ Clicked the Login button")

    # 7️⃣ Wait to observe navigation or alert
    time.sleep(3)

    # 8️⃣ Capture screenshot (for SRS evidence)
    driver.save_screenshot("UI_Test_Login_Success.png")
    print("📸 Screenshot saved as UI_Test_Login_Success.png")

except Exception as e:
    print("❌ Error during test:", e)

finally:
    driver.quit()
