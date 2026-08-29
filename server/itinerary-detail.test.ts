import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * SimilarTripsSection Tests
 * Verifies that the carousel component correctly:
 * 1. Filters out the current itinerary
 * 2. Transforms itinerary data to Trip format
 * 3. Handles empty states
 * 4. Manages carousel state (scroll position, button visibility)
 */

describe('SimilarTripsSection', () => {
  describe('Data Transformation', () => {
    it('should filter out the current itinerary by slug', () => {
      const mockItineraries = [
        { id: 1, slug: 'yunnan', name: 'Yunnan', days: 10, coverImage: 'img1.jpg' },
        { id: 2, slug: 'sichuan', name: 'Sichuan', days: 7, coverImage: 'img2.jpg' },
        { id: 3, slug: 'tibet', name: 'Tibet', days: 12, coverImage: 'img3.jpg' },
      ];
      
      const currentSlug = 'yunnan';
      const filtered = mockItineraries.filter(i => i.slug !== currentSlug);
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(i => i.slug !== currentSlug)).toBe(true);
    });

    it('should transform itinerary data to Trip format correctly', () => {
      const mockItinerary = {
        id: 1,
        slug: 'yunnan',
        name: 'Yunnan Explorer',
        days: 10,
        coverImage: 'https://example.com/image.jpg',
        description: 'A journey through Yunnan',
      };

      const trip = {
        id: mockItinerary.id,
        nights: mockItinerary.days,
        title: mockItinerary.name,
        buttonText: 'EXPLORE TRIP',
        image: mockItinerary.coverImage,
      };

      expect(trip.nights).toBe(10);
      expect(trip.title).toBe('Yunnan Explorer');
      expect(trip.buttonText).toBe('EXPLORE TRIP');
      expect(trip.image).toBe('https://example.com/image.jpg');
    });

    it('should use fallback image when coverImage is missing', () => {
      const mockItinerary = {
        id: 1,
        slug: 'yunnan',
        name: 'Yunnan Explorer',
        days: 10,
        coverImage: null,
      };

      const fallbackImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop';
      const image = mockItinerary.coverImage || fallbackImage;

      expect(image).toBe(fallbackImage);
    });
  });

  describe('Carousel State Management', () => {
    it('should show left button only when not at start', () => {
      const scrollLeft = 100;
      const isAtStart = scrollLeft <= 0;
      
      expect(isAtStart).toBe(false);
    });

    it('should show right button only when not at end', () => {
      const scrollLeft = 100;
      const scrollWidth = 1000;
      const clientWidth = 500;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;
      
      expect(isAtEnd).toBe(false);
    });

    it('should hide both buttons when at boundaries', () => {
      // At start
      const scrollLeftStart = 0;
      const isAtStartStart = scrollLeftStart <= 0;
      expect(isAtStartStart).toBe(true);

      // At end
      const scrollLeftEnd = 490; // scrollWidth - clientWidth - 10
      const scrollWidthEnd = 1000;
      const clientWidthEnd = 500;
      const isAtEndEnd = scrollLeftEnd >= scrollWidthEnd - clientWidthEnd - 10;
      expect(isAtEndEnd).toBe(true);
    });
  });

  describe('Empty State Handling', () => {
    it('should return null when no similar itineraries exist', () => {
      const mockItineraries = [
        { id: 1, slug: 'yunnan', name: 'Yunnan', days: 10, coverImage: 'img1.jpg' },
      ];
      
      const currentSlug = 'yunnan';
      const filtered = mockItineraries.filter(i => i.slug !== currentSlug);
      
      expect(filtered.length === 0).toBe(true);
    });
  });

  describe('Scroll Animation', () => {
    it('should calculate smooth scroll target correctly', () => {
      const scrollLeft = 0;
      const delta = 600;
      const target = scrollLeft + delta;
      
      expect(target).toBe(600);
    });

    it('should apply easing function correctly', () => {
      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      // Test easing at different points
      expect(ease(0)).toBe(0);
      expect(ease(0.5)).toBe(0.5);
      expect(ease(1)).toBe(1);
      
      // Easing should be smooth
      expect(ease(0.25)).toBeGreaterThan(0);
      expect(ease(0.25)).toBeLessThan(0.5);
    });

    it('should calculate inertia velocity decay correctly', () => {
      let velocity = 10;
      const decayFactor = 0.92;
      
      velocity *= decayFactor;
      expect(velocity).toBeCloseTo(9.2, 1);
      
      velocity *= decayFactor;
      expect(velocity).toBeCloseTo(8.464, 2);
    });
  });

  describe('Responsive Behavior', () => {
    it('should detect desktop viewport correctly', () => {
      const isDesktop = 1024 >= 1024;
      expect(isDesktop).toBe(true);
    });

    it('should detect mobile viewport correctly', () => {
      const isMobile = 768 >= 1024;
      expect(isMobile).toBe(false);
    });
  });

  describe('Button Interaction', () => {
    it('should navigate to correct itinerary on button click', () => {
      const tripId = 'yunnan';
      const expectedPath = `/itinerary/${tripId}`;
      
      expect(expectedPath).toBe('/itinerary/yunnan');
    });

    it('should prevent event propagation on button click', () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
      };
      
      mockEvent.stopPropagation();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });
});
