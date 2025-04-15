import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Rooms from "@/pages/Rooms";
import RoomDetail from "@/pages/RoomDetail";
import MyBookings from "@/pages/MyBookings";
import BookingDetail from "@/pages/BookingDetail";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import AdminRooms from "@/pages/AdminRooms";
import AdminBookings from "@/pages/AdminBookings";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "./hooks/useAuth";

// Load Material Icons from CDN
const MaterialIconsLink = () => {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Slab:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
    </>
  );
};

function App() {
  const { isLoading } = useAuth();

  // Show loading state if auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <MaterialIconsLink />
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/rooms" component={Rooms} />
          <Route path="/rooms/:id" component={RoomDetail} />
          <Route path="/my-bookings" component={MyBookings} />
          <Route path="/booking/:reference" component={BookingDetail} />
          <Route path="/login" component={Login} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/rooms" component={AdminRooms} />
          <Route path="/admin/bookings" component={AdminBookings} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </>
  );
}

export default App;
