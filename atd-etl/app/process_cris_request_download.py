#!/usr/bin/env python
"""
CRIS - Request Download
Author: Austin Transportation Department, Data and Technology Office

Description: This script will process emails deposited on an S3 bucket on AWS.
Data extracts are routed and saved into a private S3 bucket where they will be
waiting to be 'processed'. The emails contain a download link, which requires
the user to log in to the CRIS website and proceed to the download.

The application requires the boto3 and mail-parser libraries:
    https://pypi.org/project/boto3/
    https://pypi.org/project/mail-parser/
"""
import mailparser
import boto3

print("First test")
