import { fireEvent, render, screen, within } from '@testing-library/react';
import { InstitutionDirectory, type InstitutionCardData } from '@/components/institution-directory';

const institutions: InstitutionCardData[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Mwea Community School',
    kind: 'school',
    location: 'Mwea, Kenya',
    summary: 'A community-led school.',
    opportunityCount: 1,
    fundingSlug: 'school-kitchen',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'North Clinic',
    kind: 'hospital',
    location: 'Nairobi, Kenya',
    summary: null,
    opportunityCount: 0,
    fundingSlug: null,
  },
];

describe('institution directory', () => {
  it('only renders work and funding actions when their live destinations exist', () => {
    render(<InstitutionDirectory configured institutions={institutions} loadError={null} />);

    const school = screen.getByRole('article', { name: /Mwea Community School/ });
    expect(within(school).getByRole('link', { name: 'Find work' })).toHaveAttribute(
      'href',
      '/commons/opportunities?institution=11111111-1111-4111-8111-111111111111',
    );
    expect(within(school).getByRole('link', { name: 'Discuss funding' })).toHaveAttribute(
      'href',
      '/tenders/school-kitchen#capital-intent',
    );

    const clinic = screen.getByRole('article', { name: /North Clinic/ });
    expect(within(clinic).queryByRole('link')).not.toBeInTheDocument();
    expect(within(clinic).queryByText(/valuation|yield|investment/i)).not.toBeInTheDocument();
  });

  it('filters published institutions by type and search query', () => {
    render(<InstitutionDirectory configured institutions={institutions} loadError={null} />);

    fireEvent.click(screen.getByRole('button', { name: 'Hospital' }));
    expect(screen.getByRole('heading', { name: 'North Clinic' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mwea Community School' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'All institutions' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search institutions' }), {
      target: { value: 'Mwea' },
    });
    expect(screen.getByRole('heading', { name: 'Mwea Community School' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'North Clinic' })).not.toBeInTheDocument();
  });

  it('shows explicit unavailable and empty states instead of demo institutions', () => {
    const { rerender } = render(<InstitutionDirectory configured={false} institutions={[]} loadError={null} />);
    expect(screen.getByText('No live institution directory is available.')).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative|demo/i)).not.toBeInTheDocument();

    rerender(<InstitutionDirectory configured institutions={[]} loadError={null} />);
    expect(screen.getByText('No institution profile is published yet.')).toBeInTheDocument();
  });
});
