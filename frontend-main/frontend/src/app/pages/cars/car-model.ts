interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  transmission: string;
  fuelType: string;
  features: string[];
  imageUrl: string;
  description: string;
  available: boolean;
  location: string; 
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}
