import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import AddSite from '../pages/AddSite';
import EditSite from '../pages/EditSite';
import MyFountains from '../pages/MyFountains';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/add-site" element={<AddSite />} />
      <Route path="/edit-site/:id" element={<EditSite />} />
      <Route path="/my-fountains" element={<MyFountains />} />
    </Routes>
  );
}

export default AppRoutes;
