"""Basic auth input regression tests.

These tests do not connect to MongoDB; they cover the validation boundary used
by the register and login request models.
"""

import unittest
from types import SimpleNamespace

from pydantic import ValidationError
from fastapi import HTTPException

from app.models.user import UserCreate, UserLogin
from app.core import rate_limit


class UserValidationTests(unittest.TestCase):
    def test_rejects_names_with_numbers_or_symbols(self):
        for name in ("123456", "John123", "John_Doe", "John-Doe"):
            with self.subTest(name=name):
                with self.assertRaisesRegex(ValidationError, "Name can only contain alphabets"):
                    UserCreate(name=name, email="person@gmail.com", password="StrongPass1")

    def test_accepts_alphabetic_name_with_spaces(self):
        user = UserCreate(name="John Doe", email="person@gmail.com", password="StrongPass1")
        self.assertEqual(user.name, "John Doe")

    def test_rejects_numeric_only_email_username(self):
        with self.assertRaises(ValidationError):
            UserCreate(name="Test User", email="123456@gmail.com", password="StrongPass1")

    def test_rejects_malformed_email_domains(self):
        for email in ("person@gmail", "person@-gmail.com", "person@gmail..com", "person..name@gmail.com"):
            with self.subTest(email=email):
                with self.assertRaises(ValidationError):
                    UserCreate(name="Test User", email=email, password="StrongPass1")

    def test_accepts_normal_email(self):
        user = UserCreate(name="Test User", email="person.one+tag@gmail.com", password="StrongPass1")
        self.assertEqual(user.email, "person.one+tag@gmail.com")

    def test_rejects_weak_passwords(self):
        for password in ("short1A", "lowercase1", "UPPERCASE1", "NoNumbers"):
            with self.subTest(password=password):
                with self.assertRaises(ValidationError):
                    UserCreate(name="Test User", email="person@gmail.com", password=password)

    def test_rejects_password_containing_identity(self):
        with self.assertRaises(ValidationError):
            UserCreate(name="Swaraj Singh", email="swaraj@gmail.com", password="Swaraj Singh1")

    def test_login_normalizes_email_but_requires_valid_format(self):
        credentials = UserLogin(email=" Person@Gmail.com ", password="password")
        self.assertEqual(credentials.email, "person@gmail.com")
        with self.assertRaises(ValidationError):
            UserLogin(email="1234@gmail.com", password="password")

    def test_rate_limit_returns_429_after_limit(self):
        scope = "test-auth"
        request = SimpleNamespace(client=SimpleNamespace(host="test-client"))
        rate_limit._attempts.clear()
        rate_limit.enforce_rate_limit(request, scope, max_attempts=2, window_seconds=60)
        rate_limit.enforce_rate_limit(request, scope, max_attempts=2, window_seconds=60)
        with self.assertRaises(HTTPException) as context:
            rate_limit.enforce_rate_limit(request, scope, max_attempts=2, window_seconds=60)
        self.assertEqual(context.exception.status_code, 429)
        rate_limit._attempts.clear()


if __name__ == "__main__":
    unittest.main()
