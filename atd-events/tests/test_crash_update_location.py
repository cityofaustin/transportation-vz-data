#!/usr/bin/env python
import pytest
import json
import pdb

from .json_helper import load_file
from crash_update_location.app import *

data_cr3_insertion_valid = load_file("tests/data/data_cr3_insertion_valid.json")
data_cr3_insertion_invalid = load_file("tests/data/data_cr3_insertion_invalid.json")


class TestCrashUpdateLocation:
    @classmethod
    def setup_class(cls):
        print("Beginning tests for: TestCrashUpdateLocation")

    @classmethod
    def teardown_class(cls):
        print("\n\nAll tests finished for: TestCrashUpdateLocation")

    def test_critical_error_success(self):
        try:
            raise_critical_error(
                message="This is a test",
                data={"Test": "One"},
                exception_type=TypeError
            )
            assert False
        except TypeError:
            assert True

    def test_critical_error_fail(self):
        try:
            raise_critical_error(
                message="",
                data={},
                exception_type=None
            )
            assert False
        except TypeError:
            assert True

    def test_is_insert_valid(self):
        """
        This test should check whether the payload is an insertion
        """
        assert is_insert(data_cr3_insertion_valid)

    def test_is_insert_invalid(self):
        """
        This test should check whether the function can tell if this is NOT
        an insertion, and should assert False.
        """
        assert is_insert(data_cr3_insertion_invalid) is False

    def test_is_insert_exception_1(self):
        """
        Test is_insert with an empty dictionary
        """
        try:
            assert is_insert({})
        except KeyError:
            assert True

    def test_is_insert_exception_2(self):
        """
        This is_insert with None value
        """
        try:
            assert is_insert(None)
        except KeyError:
            assert True

    def test_is_crash_mainlane_int_true(self):
        """
        Tests if a crash is mainlane, it should assert True
        """
        assert is_crash_mainlane(11425861)

    def test_is_crash_mainlane_str_true(self):
        """
        Tests if a crash is mainlane, it should assert True
        """
        assert is_crash_mainlane("11425861")

    def test_is_crash_mainlane_false(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane("11425868") is False

    def test_is_crash_mainlane_none(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane(None) is False

    def test_is_crash_mainlane_letters(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane("A123") is False

    def test_get_crash_id_true(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_crash_id(data_cr3_insertion_valid) == 17697596

    def test_get_crash_id_false(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_crash_id({"event": {"data": {"new": {"crash_id": None}}}}) != 1

    def test_get_location_id_true(self):
        """
        Tests if the location id is returned
        """
        assert get_location_id(data_cr3_insertion_valid) == "SCRAMBLED1234"

    def test_get_location_id_false(self):
        """
        Tests if the location id is returned, tests false
        """
        assert get_location_id({"event": {"data": {"new": {"location_id": None}}}}) != "SCRAMBLED1234"

    def test_get_location_id_empty(self):
        """
        Tests if the crash id returns None if the record is invalid
        """
        assert get_location_id({}) is None

    def test_get_location_id_none(self):
        """
        Tests if the crash id returns None if the record is invalid
        """
        assert get_location_id(None) is None

    def test_load_data_success(self):
        """
        Tests whether load_data can parse a string into a dictionary
        """
        assert isinstance(load_data("{}"), dict)

    def test_load_data_failure_none(self):
        """
        Tests whether load_data can parse a string into a dictionary
        """
        try:
            assert isinstance(load_data(None), dict)
        except TypeError:
            assert True

    def test_load_data_failure_invalid(self):
        """
        Tests whether load_data can parse a string into a dictionary
        """
        try:
            isinstance(load_data("{'invalid': 'json'}"), dict)
            assert False
        except TypeError:
            assert True

    def test_find_crash_location_true(self):
        """
        Tests whether it can find a location for a crash accurately.
        """
        assert find_crash_location(16517389) == '16D91EA018'

    def test_find_crash_location_false(self):
        """
        Tests whether it can find a location for a crash accurately.
        """
        # Crash: 16517390 -> Location: 25A721EBE7
        assert find_crash_location(16517390) != "16D91EA018"

    def test_find_crash_location_none(self):
        """
        Tests if it returns None if the value for crash_id is None
        """
        assert find_crash_location(None) is None

    def test_find_crash_location_nonnumeric(self):
        """
        Tests if the crash_id is not numeric, if not returns None
        """
        assert find_crash_location("ABC123") is None

    def test_find_crash_location_decimal(self):
        """
        Tests if the crash_id is not numeric, if not returns None
        """
        assert find_crash_location("1234.154") is None

    def test_get_cr3_location_id_not_null(self):
        """
        Tests if the get_cr3_location_id returns a not null id
        """
        assert get_cr3_location_id(16517389) == '16D91EA018'

    def test_get_cr3_location_id_null(self):
        """
        Tests if the get_cr3_location_id returns a null id
        """
        assert get_cr3_location_id(17198925) == None

    def test_get_cr3_location_id_nonnumeric(self):
        """
        Tests if the get_cr3_location_id returns a null id
        """
        assert get_cr3_location_id("ABC1234") == None

    def test_get_cr3_location_id_decimal(self):
        """
        Tests if the get_cr3_location_id returns a null id
        """
        assert get_cr3_location_id(1234.56) == None

    def test_update_location_valid(self):
        """
        Tests if a record can be updated to a new location
        """
        response = update_location(1000, "ABC123456")

        assert isinstance(response, dict)
        assert "status" in response and "response" in response
        assert response["status"] == "Mutation Successful"
        assert get_cr3_location_id(1000) == "ABC123456"

    def test_update_location_none(self):
        """
        Tests if a record can be updated to a new location
        """
        response = update_location(1000, None)
        assert isinstance(response, dict)
        assert "status" in response and "response" in response
        assert response["status"] == "Mutation Successful"
        assert get_cr3_location_id(1000) == None
