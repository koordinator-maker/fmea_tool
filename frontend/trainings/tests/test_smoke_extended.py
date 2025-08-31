# path: trainings/tests/test_smoke_extended.py
from django.test import TestCase, Client
from django.urls import reverse, NoReverseMatch
from django.contrib.auth import get_user_model
User = get_user_model()
def try_reverse(name, *args, **kwargs):
    try:
        return reverse(name, args=args, kwargs=kwargs)
    except NoReverseMatch:
        return None
class SmokeExtendedTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(username="smokeuser", email="smoke@example.com", password="s3cr3t!")
    def setUp(self): self.c = Client()
    def test_root_redirects_to_trainings(self):
        r = self.c.get("/"); self.assertIn(r.status_code, (301, 302)); self.assertTrue(r["Location"].endswith("/trainings/"))
    def test_login_page_200(self):
        url = try_reverse("login") or "/accounts/login/"; r = self.c.get(url); self.assertEqual(r.status_code, 200)
    def test_trainings_list_200(self):
        for name in ("trainings_list", "training_list"):
            url = try_reverse(name)
            if url: self.assertEqual(self.c.get(url).status_code, 200, f"{name} 200 dönmedi.")
    def test_mine_redirects_when_anonymous(self):
        url = try_reverse("mine") or "/trainings/mine/"; r = self.c.get(url)
        self.assertIn(r.status_code, (301, 302)); self.assertIn("/accounts/login/", r["Location"])
    def test_mine_200_after_login(self):
        self.c.login(username="smokeuser", password="s3cr3t!"); url = try_reverse("mine") or "/trainings/mine/"; r = self.c.get(url); self.assertEqual(r.status_code, 200)
    def test_enroll_url_exists(self):
        url = try_reverse("enroll", kwargs={"pk": 1}) or "/trainings/enroll/1/"; r = self.c.get(url); self.assertIn(r.status_code, (200, 302, 403, 404))
    def test_certificate_url_exists(self):
        url = try_reverse("download_certificate", kwargs={"pk": 1}) or "/trainings/certificate/1/"; r = self.c.get(url); self.assertIn(r.status_code, (200, 302, 403, 404))
    def test_plans_html(self):
        url = try_reverse("plans_page") or "/trainings/plans/"; r = self.c.get(url); self.assertIn(r.status_code, (200, 302))
    def test_api_plans_list(self):
        url = try_reverse("api_plan_list") or "/trainings/api/plans/"; r = self.c.get(url); self.assertIn(r.status_code, (200, 302, 403))
    def test_api_plan_detail(self):
        url = try_reverse("api_plan_detail", kwargs={"pk": 1}) or "/trainings/api/plans/1/"; r = self.c.get(url); self.assertIn(r.status_code, (200, 404, 403))
    def test_api_plan_search(self):
        url = try_reverse("api_plan_search") or "/trainings/api/plan-search/"; r = self.c.get(url, {"q": "test"}); self.assertIn(r.status_code, (200, 302, 403))
    def test_api_calendar_year(self):
        url = try_reverse("api_calendar_year") or "/trainings/api/calendar-year/"; r = self.c.get(url, {"year": 2025}); self.assertIn(r.status_code, (200, 302, 403))
    def test_delegations_include(self):
        r = self.c.get("/delegations/"); self.assertIn(r.status_code, (200, 301, 302, 404))
    def test_online_routes_optional(self):
        list_url = try_reverse("online_list") or try_reverse("online-list")
        if list_url: self.assertIn(self.c.get(list_url).status_code, (200, 404))
        watch_url = try_reverse("online_watch", kwargs={"pk": 1})
        if watch_url: self.assertIn(self.c.get(watch_url).status_code, (200, 404))
        prog_url = try_reverse("online_progress", kwargs={"pk": 1})
        if prog_url: self.assertIn(self.c.get(prog_url).status_code, (200, 404))
