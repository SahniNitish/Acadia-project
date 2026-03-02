#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class AcadiaSafeDashboardAPITester:
    def __init__(self):
        self.base_url = "https://safe-command.preview.emergentagent.com/api"  # From frontend/.env REACT_APP_BACKEND_URL
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED - {message}")
        else:
            print(f"❌ {test_name}: FAILED - {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })

    def test_api_health(self):
        """Test API health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("API Health Check", True, f"API is healthy. Status: {data.get('status')}")
                return True
            else:
                self.log_result("API Health Check", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("API Health Check", False, f"Request failed: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Root Endpoint", True, f"Root accessible. Message: {data.get('message')}")
                return True
            else:
                self.log_result("Root Endpoint", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Request failed: {str(e)}")
            return False

    def test_get_alerts(self):
        """Test fetching alerts"""
        try:
            response = requests.get(f"{self.base_url}/alerts", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Alerts", True, f"Successfully fetched {len(data)} alerts")
                return True
            else:
                self.log_result("Get Alerts", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Get Alerts", False, f"Request failed: {str(e)}")
            return False

    def test_create_alert(self):
        """Test creating a new alert"""
        alert_data = {
            "studentName": "Test Student",
            "studentEmail": "test.student@acadiau.ca",
            "studentPhone": "+1 (902) 555-9999",
            "location": "Test Location - Library"
        }
        try:
            response = requests.post(
                f"{self.base_url}/alerts", 
                json=alert_data, 
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 200:
                data = response.json()
                self.log_result("Create Alert", True, f"Alert created with ID: {data.get('id')}")
                return data.get('id')
            else:
                self.log_result("Create Alert", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
                return None
        except Exception as e:
            self.log_result("Create Alert", False, f"Request failed: {str(e)}")
            return None

    def test_get_incidents(self):
        """Test fetching incidents"""
        try:
            response = requests.get(f"{self.base_url}/incidents", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Incidents", True, f"Successfully fetched {len(data)} incidents")
                return True
            else:
                self.log_result("Get Incidents", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Get Incidents", False, f"Request failed: {str(e)}")
            return False

    def test_create_incident(self):
        """Test creating a new incident"""
        incident_data = {
            "type": "suspicious_activity",
            "location": "Test Building",
            "description": "Test incident for API testing",
            "reporterName": "Test Reporter",
            "priority": "medium"
        }
        try:
            response = requests.post(
                f"{self.base_url}/incidents", 
                json=incident_data, 
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 200:
                data = response.json()
                self.log_result("Create Incident", True, f"Incident created with ID: {data.get('id')}")
                return data.get('id')
            else:
                self.log_result("Create Incident", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
                return None
        except Exception as e:
            self.log_result("Create Incident", False, f"Request failed: {str(e)}")
            return None

    def test_get_escorts(self):
        """Test fetching escorts"""
        try:
            response = requests.get(f"{self.base_url}/escorts", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Escorts", True, f"Successfully fetched {len(data)} escorts")
                return True
            else:
                self.log_result("Get Escorts", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Get Escorts", False, f"Request failed: {str(e)}")
            return False

    def test_create_escort(self):
        """Test creating a new escort request"""
        escort_data = {
            "studentName": "Test Student",
            "studentPhone": "+1 (902) 555-8888",
            "pickup": "Test Pickup Location",
            "destination": "Test Destination"
        }
        try:
            response = requests.post(
                f"{self.base_url}/escorts", 
                json=escort_data, 
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 200:
                data = response.json()
                self.log_result("Create Escort", True, f"Escort created with ID: {data.get('id')}")
                return data.get('id')
            else:
                self.log_result("Create Escort", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
                return None
        except Exception as e:
            self.log_result("Create Escort", False, f"Request failed: {str(e)}")
            return None

    def test_get_users(self):
        """Test fetching users"""
        try:
            response = requests.get(f"{self.base_url}/users", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Users", True, f"Successfully fetched {len(data)} users")
                return True
            else:
                self.log_result("Get Users", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Get Users", False, f"Request failed: {str(e)}")
            return False

    def test_get_broadcasts(self):
        """Test fetching broadcasts"""
        try:
            response = requests.get(f"{self.base_url}/broadcasts", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Broadcasts", True, f"Successfully fetched {len(data)} broadcasts")
                return True
            else:
                self.log_result("Get Broadcasts", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Get Broadcasts", False, f"Request failed: {str(e)}")
            return False

    def test_seed_demo_data(self):
        """Test seeding demo data"""
        try:
            response = requests.post(f"{self.base_url}/seed-demo-data", timeout=15)
            if response.status_code == 200:
                data = response.json()
                counts = data.get('counts', {})
                self.log_result("Seed Demo Data", True, 
                    f"Demo data seeded: {counts.get('alerts', 0)} alerts, "
                    f"{counts.get('incidents', 0)} incidents, {counts.get('escorts', 0)} escorts")
                return True
            else:
                self.log_result("Seed Demo Data", False, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Seed Demo Data", False, f"Request failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Acadia Safe Dashboard API Tests...")
        print(f"Testing API at: {self.base_url}")
        print("=" * 60)

        # Basic connectivity tests
        self.test_api_health()
        self.test_root_endpoint()

        # Seed demo data first
        self.test_seed_demo_data()
        time.sleep(1)  # Allow time for data to be inserted

        # Test GET endpoints
        self.test_get_alerts()
        self.test_get_incidents() 
        self.test_get_escorts()
        self.test_get_users()
        self.test_get_broadcasts()

        # Test POST endpoints (creating new data)
        self.test_create_alert()
        self.test_create_incident()
        self.test_create_escort()

        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! API is functioning correctly.")
            return True
        else:
            failed_tests = [r for r in self.test_results if not r['success']]
            print("❌ Some tests failed:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
            return False

def main():
    tester = AcadiaSafeDashboardAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0
            },
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())