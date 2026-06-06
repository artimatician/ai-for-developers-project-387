def health_check(client) -> dict:
    return client.get("/health").json()


def list_active_event_types(client) -> list:
    return client.get("/api/event-types").json()


def get_active_event_type(client, id: str) -> dict:
    return client.get(f"/api/event-types/{id}").json()


def get_slots(client, event_type_id: str) -> list:
    return client.get(f"/api/event-types/{event_type_id}/slots").json()


def create_booking(client, event_type_id: str, start_time: str,
                   guest_name: str, notes: str = None) -> dict:
    body = {"eventTypeId": event_type_id, "startTime": start_time, "guestName": guest_name}
    if notes is not None:
        body["notes"] = notes
    return client.post("/api/bookings", json=body).json()


def list_event_types(client) -> list:
    return client.get("/api/owner/event-types").json()


def create_event_type(client, name: str, description: str,
                      timezone: str = "UTC") -> dict:
    return client.post("/api/owner/event-types", json={
        "name": name, "description": description, "timezone": timezone,
    }).json()


def get_event_type(client, id: str) -> dict:
    return client.get(f"/api/owner/event-types/{id}").json()


def update_event_type(client, id: str, **kwargs) -> dict:
    return client.patch(f"/api/owner/event-types/{id}", json=kwargs).json()


def list_bookings(client, **params) -> list:
    return client.get("/api/owner/bookings", params=params).json()


def list_blackouts(client) -> list:
    return client.get("/api/owner/blackouts").json()


def create_blackout(client, start_time: str, end_time: str,
                    reason: str = None) -> dict:
    body = {"startTime": start_time, "endTime": end_time}
    if reason:
        body["reason"] = reason
    return client.post("/api/owner/blackouts", json=body).json()


def delete_blackout(client, id: str):
    return client.delete(f"/api/owner/blackouts/{id}")
