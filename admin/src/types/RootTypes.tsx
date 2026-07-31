export interface LangTypes {
  en: string,
  uz: string,
  ru: string,
  ch: string
}


export interface AdminTypes {
  _id: string;
  firstName: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTypes {
  id: string
  firstName: string
  lastName: string
  emailAddress: string
  createdAt: number
  avatar: string
}

export interface ErrorTypes {
  response: {
    data: {
      message: string
      statusCode: number
    }
  }
}

export interface BlogTypes {
  _id?: string;
  createdAt?: string;
  title: LangTypes
  text: LangTypes;
  image?: string;
}

export interface ServiceTypes {
  _id?: string;
  createdAt?: string;
  title: LangTypes;
  text: LangTypes;
  image?: string;
}

export interface ProductTypes {
  _id?: string;
  createdAt?: string;
  title: LangTypes;
  image?: string;
  category?: string;
  number: number;
  sizes?: Array<{
    size: string;
    stock: boolean;
    package: string;
    price: {
      rub: string;
      uzs: string;
      usd: string;
      yuan: string;
    };
  }>;
  stock?: boolean;
}

export interface CommentTypes {
  _id?: string;
  createdAt?: string;
  name: LangTypes;
  text: LangTypes;
  image?: string;
  job: LangTypes
}

export interface ContactTypes {
  _id?: string;
  createdAt?: string;
  name: string;
  website: string;
  email: string;
  message: string
}

export interface OrderTypes {
  _id?: string;
  order_id?: string;
  total_price?: number;
  status?: string;
  payment?: string;
  payment_status?: string;
  driver?: boolean;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  products?: Array<{
    _id?: string;
    quantity?: number;
    price?: number;
    size: string
    number: string
    product_id?: {
      _id?: string;
      title?: LangTypes;
      image?: string;
    };
  }>;
  createdAt?: string;
  updatedAt?: string;
}