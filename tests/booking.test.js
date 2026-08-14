const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'https://restful-booker.herokuapp.com';

let token;
let bookingId;

const bookingData = {
    firstname: 'John',
    lastname: 'Doe',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
        checkin: '2026-08-20',
        checkout: '2026-08-25'
    },
    additionalneeds: 'Breakfast'
};

const updatedBookingData = {
    firstname: 'UpdatedJohn',
    lastname: 'UpdatedDoe',
    totalprice: 250,
    depositpaid: false,
    bookingdates: {
        checkin: '2026-08-21',
        checkout: '2026-08-28'
    },
    additionalneeds: 'Lunch'
};


/**
 * Assert that response has JSON content type.
 */
function assertJsonContentType(response) {
    const contentType = response.headers.get('content-type');

    assert.ok(
        contentType,
        'Content-Type header should exist'
    );

    assert.match(
        contentType,
        /application\/json/i,
        'Content-Type should contain application/json'
    );
}


/**
 * Parse JSON response after checking Content-Type.
 */
async function getJsonResponse(response) {
    assertJsonContentType(response);

    return await response.json();
}


describe('Restful Booker API workflow', { concurrency: false }, () => {

    /**
     * Create authentication token before tests.
     */
    before(async () => {
        const response = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123'
            })
        });

        // Status assertion
        assert.equal(
            response.status,
            200,
            'Authentication should return status 200'
        );

        // Header assertion
        assertJsonContentType(response);

        // Body assertion
        const data = await response.json();

        assert.ok(
            data.token,
            'Authentication response should contain token'
        );

        assert.equal(
            typeof data.token,
            'string',
            'Token should be a string'
        );

        token = data.token;

        console.log('Authentication token created successfully');
    });


    /**
     * Test 1:
     * Create a new booking.
     */
    test('Create a new booking', async () => {
        const response = await fetch(`${BASE_URL}/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        // Status assertion
        assert.equal(
            response.status,
            200,
            'Create booking should return status 200'
        );

        // Header + body
        const data = await getJsonResponse(response);

        // Body assertions
        assert.ok(
            data.bookingid,
            'Response should contain bookingid'
        );

        assert.equal(
            typeof data.bookingid,
            'number',
            'bookingid should be a number'
        );

        assert.ok(
            data.booking,
            'Response should contain booking object'
        );

        assert.equal(
            data.booking.firstname,
            bookingData.firstname
        );

        assert.equal(
            data.booking.lastname,
            bookingData.lastname
        );

        assert.equal(
            data.booking.totalprice,
            bookingData.totalprice
        );

        assert.equal(
            data.booking.depositpaid,
            bookingData.depositpaid
        );

        assert.deepEqual(
            data.booking.bookingdates,
            bookingData.bookingdates
        );

        assert.equal(
            data.booking.additionalneeds,
            bookingData.additionalneeds
        );

        // Save ID for subsequent tests
        bookingId = data.bookingid;

        console.log(`Booking created with ID: ${bookingId}`);
    });


    /**
     * Test 2:
     * Get the created booking.
     */
    test('Get created booking by ID', async () => {
        assert.ok(
            bookingId,
            'Booking ID should exist before retrieving booking'
        );

        const response = await fetch(
            `${BASE_URL}/booking/${bookingId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        // Status assertion
        assert.equal(
            response.status,
            200,
            'Get booking should return status 200'
        );

        // Header + body
        const data = await getJsonResponse(response);

        // Body assertions
        assert.equal(
            data.firstname,
            bookingData.firstname
        );

        assert.equal(
            data.lastname,
            bookingData.lastname
        );

        assert.equal(
            data.totalprice,
            bookingData.totalprice
        );

        assert.equal(
            data.depositpaid,
            bookingData.depositpaid
        );

        assert.deepEqual(
            data.bookingdates,
            bookingData.bookingdates
        );

        assert.equal(
            data.additionalneeds,
            bookingData.additionalneeds
        );
    });


    /**
     * Test 3:
     * Update the created booking.
     */
    test('Update booking', async () => {
        assert.ok(
            bookingId,
            'Booking ID should exist before updating booking'
        );

        assert.ok(
            token,
            'Authentication token should exist before updating booking'
        );

        const response = await fetch(
            `${BASE_URL}/booking/${bookingId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cookie': `token=${token}`
                },
                body: JSON.stringify(updatedBookingData)
            }
        );

        // Status assertion
        assert.equal(
            response.status,
            200,
            'Update booking should return status 200'
        );

        // Header + body
        const data = await getJsonResponse(response);

        // Body assertions
        assert.equal(
            data.firstname,
            updatedBookingData.firstname
        );

        assert.equal(
            data.lastname,
            updatedBookingData.lastname
        );

        assert.equal(
            data.totalprice,
            updatedBookingData.totalprice
        );

        assert.equal(
            data.depositpaid,
            updatedBookingData.depositpaid
        );

        assert.deepEqual(
            data.bookingdates,
            updatedBookingData.bookingdates
        );

        assert.equal(
            data.additionalneeds,
            updatedBookingData.additionalneeds
        );
    });


    /**
     * Test 4:
     * Delete the booking.
     */
    test('Delete booking', async () => {
        assert.ok(
            bookingId,
            'Booking ID should exist before deleting booking'
        );

        assert.ok(
            token,
            'Authentication token should exist before deleting booking'
        );

        const response = await fetch(
            `${BASE_URL}/booking/${bookingId}`,
            {
                method: 'DELETE',
                headers: {
                    'Cookie': `token=${token}`
                }
            }
        );

        // Status assertion
        assert.equal(
            response.status,
            201,
            'Delete booking should return status 201'
        );
    });


    /**
     * Test 5:
     * Verify that the booking was deleted.
     */
    test('Verify booking was deleted', async () => {
        assert.ok(
            bookingId,
            'Booking ID should exist'
        );

        const response = await fetch(
            `${BASE_URL}/booking/${bookingId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        // Status assertion
        assert.equal(
            response.status,
            404,
            'Deleted booking should return status 404'
        );
    });


    /**
     * Cleanup
     */
    after(() => {
        token = undefined;
        bookingId = undefined;
    });
});