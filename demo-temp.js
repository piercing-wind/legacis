export const chart = {
    "data": {
        "order": {
            "order_id": "LGC-d064ffef-1749819977681",
            "order_amount": 5397,
            "order_currency": "INR",
            "order_tags": {
                "agreement": "IA Service Agreement, RA Service Agreement",
                "coupon": "2",
                "serviceId": "b7e2a1c2-9d4e-4f3a-8c2e-1a2b3c4d5e62",
                "tenureDays": "90",
                "tenureDicount": "10"
            }
        },
        "payment": {
            "cf_payment_id": "5114918596718",
            "payment_status": "SUCCESS",
            "payment_amount": 5397,
            "payment_currency": "INR",
            "payment_message": "Simulated response message",
            "payment_time": "2025-06-13T18:36:40+05:30",
            "bank_reference": "1234567890",
            "auth_id": null,
            "payment_method": {
                "upi": {
                    "channel": null,
                    "upi_id": "testsuccess@gocash",
                    "upi_payer_ifsc": null,
                    "upi_payer_account_number": null,
                    "upi_instrument": "UPI",
                    "upi_instrument_number": null
                }
            },
            "payment_group": "upi",
            "international_payment": {
                "international": false
            },
            "payment_surcharge": null
        },
        "customer_details": {
            "customer_name": "SAURAV SHARMA",
            "customer_id": "d064ffef-2040-4322-8749-2ea56125dccb",
            "customer_email": "samarwealth@gmail.com",
            "customer_phone": "8847674817"
        },
        "payment_gateway_details": {
            "gateway_name": "CASHFREE",
            "gateway_order_id": "2193971038",
            "gateway_payment_id": "5114918596718",
            "gateway_status_code": null,
            "gateway_order_reference_id": "null",
            "gateway_settlement": "CASHFREE",
            "gateway_reference_name": null
        },
        "payment_offers": null,
        "terminal_details": null
    },
    "event_time": "2025-06-13T18:36:58+05:30",
    "type": "PAYMENT_SUCCESS_WEBHOOK"
}