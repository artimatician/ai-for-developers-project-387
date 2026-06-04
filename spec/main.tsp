import "@typespec/http";
import "@typespec/rest";
import "./models.tsp";
import "./owner.tsp";
import "./guest.tsp";

using TypeSpec.Http;

@doc("Schedule a Call — simplified appointment scheduling service")
@server("http://localhost:8000", "Local development")
@service(#{ title: "Schedule a Call" })
namespace ScheduleACall {}
