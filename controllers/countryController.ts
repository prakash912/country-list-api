import { Request, Response } from 'express';
import { Country, Neighbor } from '../models/Country';
import { Document, SortOrder } from 'mongoose';
import { ObjectId } from 'mongodb';

interface NeighborDocument extends Document {
  countryId: string;
  neighborId: string;
  createdAt: Date;
}

export  const getAllCountries = async (req: Request, res: Response) => {
  try {
    const countries = await Country.find();
    res.status(200).json({
      message: 'Country list',
      data: { list: countries }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error', data: {} });
  }
};

export const addCountry = async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    const addedCountries = Array.isArray(requestData) ? requestData : [requestData];
    const savedCountries = await Promise.all(addedCountries.map(async (countryData: any) => {
      const newCountry = new Country(countryData);
      return await newCountry.save();
    }));
    res.status(201).json({ message: 'Countries added successfully', data: { countries: savedCountries } });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error', data: {} });
  }
};

export const getCountryDetail = async (req: Request, res: Response) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      res.status(404).json({ message: 'Country not found', data: {} });
    } else {
      res.status(200).json({
        message: 'Country detail',
        data: { country }
      });
    }
  } catch (error:any) {
    res.status(500).json({ message: 'Internal Server Error', data: {} });
  }
};

export const getCountryNeighbors = async (req: Request, res: Response) => {
  try {
    const { countryId } = req.params;
    const country = await Country.findById(countryId);
    if (!country) {
      res.status(404).json({ message: 'Country not found', data: {} });
    } else {
      const neighbors = await Neighbor.find({ countryId: countryId.toString() }).populate('neighborId');
      res.status(200).json({ message: 'Country neighbors', data: { list: neighbors.map((neighbor: any) => neighbor.neighborId) } });
    }
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const addNeighbors = async (req: Request, res: Response) => {
  try {
    const { countryId } = req.params;
    let neighborData: string[] = req.body;
    neighborData = neighborData.filter(id => id !== countryId);
    const country = await Country.findById(countryId);
    if (!country) {
      res.status(404).json({ message: 'Country not found', data: {} });
      return;
    }
    const existingCountryIds = (await Country.find({}, '_id')).map(country => country._id.toString());
    const errors: string[] = [];
    const successfulAdditions: NeighborDocument[] = [];
    for (const neighborId of neighborData) {
      if (!existingCountryIds.includes(neighborId)) {
        errors.push(`Invalid neighbor country ID: ${neighborId}`);
        continue;
      }
      const existingNeighbor = await Neighbor.findOne({ countryId: countryId.toString(), neighborId: neighborId.toString() });
      if (existingNeighbor) {
        errors.push(`Neighbor with ID ${neighborId} already exists for this country`);
        continue;
      }
      const neighbor:any = new Neighbor({ countryId: countryId.toString(), neighborId: neighborId.toString() });
      await neighbor.save();
      successfulAdditions.push(neighbor);
    }
    if (successfulAdditions.length === 0) {
      res.status(400).json({ message: 'Failed to add neighbors', data: { neighbors: [], errors } });
    } else {
      res.status(200).json({ message: 'Neighbors added successfully', data: { neighbors: successfulAdditions }, errors });
    }
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getCountriesSorted = async (req: Request, res: Response) => {
  try {
    let sortBy = req.query.sort_by || 'a_to_z';
    let sortCriteria: string | { [key: string]: SortOrder | { $meta: any; }; } | [string, SortOrder][] | null | undefined;
    switch (sortBy) {
      case 'a_to_z':
        sortCriteria = { name: 1 };
        break;
      case 'z_to_a':
        sortCriteria = { name: -1 };
        break;
      case 'population_high_to_low':
        sortCriteria = { population: -1 };
        break;
      case 'population_low_to_high':
        sortCriteria = { population: 1 };
        break;
      case 'area_high_to_low':
        sortCriteria = { area: -1 };
        break;
      case 'area_low_to_high':
        sortCriteria = { area: 1 };
        break;
      default:
        sortCriteria = { name: 1 };
        break;
    }
    const countries = await Country.find().sort(sortCriteria);
    res.status(200).json({
      message: 'Country list',
      data: { list: countries }
    });
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', data: { error } });
  }
};

export const getAllCountriesPaginated = async (req: Request, res: Response) => {
  try {
    let { page = 1, limit = 10, sort_by = 'a_to_z', search } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const skip = (page - 1) * limit;
    let sortCriteria: any = {};
    switch (sort_by) {
      case 'a_to_z':
        sortCriteria = { name: 1 };
        break;
      case 'z_to_a':
        sortCriteria = { name: -1 };
        break;
      case 'population_high_to_low':
        sortCriteria = { population: -1 };
        break;
      case 'population_low_to_high':
        sortCriteria = { population: 1 };
        break;
      case 'area_high_to_low':
        sortCriteria = { area: -1 };
        break;
      case 'area_low_to_high':
        sortCriteria = { area: 1 };
        break;
      default:
        sortCriteria = { name: 1 };
        break;
    }
    let query: any = {};
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { region: searchRegex },
          { subregion: searchRegex }
        ]
      };
    }
    const totalCountries = await Country.countDocuments(query);
    const totalPages = Math.ceil(totalCountries / limit);
    const countries = await Country.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    res.status(200).json({
      message: 'Country list',
      data: {
        list: countries,
        has_next: hasNext,
        has_prev: hasPrev,
        page: page,
        pages: totalPages,
        per_page: limit,
        total: totalCountries
      }
    });
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', data: {} });
  }
};
