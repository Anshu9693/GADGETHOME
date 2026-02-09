import React from 'react'
import HeroVideo from '../components/User/Hero3D'
import FeaturedSection from '../components/User/FeaturedSection'
import FeaturedCategories from '../components/User/FeaturedCategories'

import { useNavigate } from 'react-router-dom'
import VisitStore from '../components/User/VistitStore'
import NewArivel from '../components/User/NewArivel'
import ShopByCategories from '../components/User/ShopByCategories'
import BestSelling from './userPages/BestSelling'
import BestSellingForLandingpage from '../components/User/BestSellingForLandingpage'

const LandingPage = () => {
  const navigate = useNavigate(); 
  return (
    <div>
      <HeroVideo />
      <ShopByCategories/>
      <FeaturedSection />
      <FeaturedCategories  />
      <NewArivel/>
    <BestSellingForLandingpage/>
      

      <VisitStore/>

    </div>
  )
}

export default LandingPage
