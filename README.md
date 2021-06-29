# be_exercise
users and reservations

### Launch with
`$ docker-compose up --build`


### Create user
```
POST /signup
{
	"username": "someUser",
	"email": "someUser@user.it"
	"password": "somePassword"
}
```

### Login (will return bearer token)
```
POST /login
{
	"email": "someUser@user.it",
	"password": "somePassword"
}
```

### Get reservations (with bearer token, all query params optional

```
GET /reservations?page=0&size=10&startDate=2021-06-15 23:30:0&endDate=2021-07-16 23:30:0
[
	{
		"id": 27,
		"startDate": "2021-07-15T19:30:00.000Z",
		"endDate": "2021-07-15T20:30:00.000Z",
		"creator_id": 1,
		"table": "TABLE 1",
		"createdAt": "2021-06-29T11:59:13.800Z",
		"updatedAt": "2021-06-29T11:59:13.800Z",
		"customers": [
			{
				"id": 1,
				"username": "someUser",
				"email": "someUser@user.it"
			}
		]
	}
]
```

### Create reservation (with bearer token)
```
POST /reservations

{
	"startDate": "2021-07-15 23:30:00",
	"table": "TABLE 1"
}
```

### Add a customer to a reservation (with bearer token)
```
POST /reservations/27/customers
{
	"userId": 1
}
```
