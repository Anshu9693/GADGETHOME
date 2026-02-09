import React from 'react'
import { Toaster } from "react-hot-toast";
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Footer from './components/User/Footer.jsx'
import AdminSignup from './pages/adminPages/SignUp.jsx'
import AdminSignin from './pages/adminPages/SignIn.jsx'
import AddProduct from './pages/adminPages/AddProduct.jsx'
import MyProducts from './pages/adminPages/MyProducts.jsx'
import AdminDashboard from './pages/adminPages/DashBoard.jsx'
import EditProduct from './pages/adminPages/EditProduct.jsx'
import AdminOrders from './pages/adminPages/AdminOrders.jsx'
import AdminProfile from './pages/adminPages/AdminProfile.jsx'
import ProductListing from './pages/userPages/ProductListing.jsx'
// import AdminOrders from './pages/adminPages/AdminOrders.jsx'
import UserSignin from './pages/userPages/SignIn.jsx'
import UserSignup from './pages/userPages/SignUp.jsx'
import ProductDetail from './pages/userPages/ProductDetails.jsx'
import Wishlist from './pages/userPages/Wishlist.jsx'
import Cart from './pages/userPages/Cart.jsx'
import FeaturedProducts from './pages/userPages/FeaturedProducts.jsx'
import ExploreCategories from './pages/userPages/ExploreCategories.jsx'
import Checkout from './pages/userPages/Checkout.jsx'
import MyOrders from './pages/userPages/MyOrders.jsx'
import OrderDetails from './pages/userPages/OrderDetails.jsx'
import BestSelling from './pages/userPages/BestSelling.jsx'
import GadgetLoader from './components/User/GadgetLoader.jsx';
import About from './components/User/About.jsx';
import Contact from './components/User/Contact.jsx';
import Wearables from './pages/userPages/categories/Wearables.jsx';
import Entertainment from './pages/userPages/categories/Entertainment.jsx';
import HomeSecurity from './pages/userPages/categories/HomeSecurity.jsx';
import KitchenGadgets from './pages/userPages/categories/KitchenGadgets.jsx';
import SmartLighting from './pages/userPages/categories/SmartLighting.jsx';
import UserProfile from './pages/userPages/UserProfile.jsx';


// Routes

const App = () => {
  return (
    <>
     <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#0b0b0b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/admin/signup" element={<AdminSignup />} /> */}
        <Route path="/admin/signin" element={<AdminSignin />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/products" element={<MyProducts />} />
        <Route path="/editproduct/:id" element={<EditProduct />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/profile" element={<AdminProfile />} />  
        

    {/* USER PAGES */}

        <Route path="/user/allproducts" element={<ProductListing/>} />
        <Route path="/user/signin" element={<UserSignin/>} />
        <Route path="/user/signup" element={<UserSignup/>} />

        <Route path="/user/productDetail/:id" element={<ProductDetail/>} />
        <Route path="/user/wishlist" element={<Wishlist/>} />
        <Route path="/user/cart" element={<Cart/>} />
        <Route path="/user/featured" element={<FeaturedProducts/>} />
        <Route path="/user/explorcategory" element={<ExploreCategories/>} />
        <Route path="/user/Checkout" element={<Checkout/>} />
        <Route path="/user/myorders" element={<MyOrders/>} />
        <Route path="/user/order/:orderId" element={<OrderDetails/>} />
        <Route path="/user/bestselling" element={<BestSelling/>} />
        <Route path="/user/loader" element={<GadgetLoader/>} />
        <Route path="/user/about" element={<About/>} />
        <Route path="/user/contact" element={<Contact/>} />
        <Route path="/user/profile" element={<UserProfile/>} />





          {/* //categories */}
        <Route path="/user/Category/entertainment" element={<Entertainment/>} />
        <Route path="/user/Category/homesecurity" element={<HomeSecurity/>} />
        <Route path="/user/Category/kitchen" element={<KitchenGadgets/>} />
        <Route path="/user/Category/smartlighting" element={<SmartLighting/>} />
        <Route path="/user/Category/wearables" element={<Wearables/>} />


      </Routes> 

        <Footer/>
    </>
  )
}

export default App
