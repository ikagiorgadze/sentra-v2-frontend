import { useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { RequestFormValues } from '../../types/requestFormSchema';

const departmentOptions = [
  { value: 'corporate_affairs', label: 'Corporate Affairs' },
  { value: 'pr_communications', label: 'PR/Communications' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'research_academic', label: 'Research/Academic' },
  { value: 'other', label: 'Other' },
] as const;

export function YourDetailsSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RequestFormValues>();

  const department = watch('department');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization / Client Name */}
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization / Client Name</Label>
          <Input
            id="organizationName"
            placeholder="Organization or client name"
            {...register('organizationName')}
          />
          {errors.organizationName && (
            <p className="text-sm text-destructive mt-1">
              {errors.organizationName.message}
            </p>
          )}
        </div>

        {/* Department / Team */}
        <div className="space-y-2">
          <Label htmlFor="department">Department / Team</Label>
          <Select
            value={department}
            onValueChange={(value) =>
              setValue('department', value as RequestFormValues['department'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-sm text-destructive mt-1">
              {errors.department.message}
            </p>
          )}

          {department === 'other' && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="departmentOther">Please specify</Label>
              <Input
                id="departmentOther"
                placeholder="Specify your department"
                {...register('departmentOther')}
              />
              {errors.departmentOther && (
                <p className="text-sm text-destructive mt-1">
                  {errors.departmentOther.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Primary Contact */}
        <div className="space-y-2">
          <Label>Primary Contact</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name</Label>
              <Input
                id="contactName"
                placeholder="Contact name"
                {...register('contactName')}
              />
              {errors.contactName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contactName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@example.com"
                {...register('contactEmail')}
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              placeholder="Phone number (optional)"
              {...register('contactPhone')}
            />
          </div>
        </div>

        {/* Project / Campaign Name */}
        <div className="space-y-2">
          <Label htmlFor="projectName">Project / Campaign Name</Label>
          <Input
            id="projectName"
            placeholder="Project or campaign name (optional)"
            {...register('projectName')}
          />
        </div>

        {/* Additional Context */}
        <div className="space-y-2">
          <Label htmlFor="additionalContext">Additional Context</Label>
          <Textarea
            id="additionalContext"
            placeholder="Provide any additional context about your campaign strategy, potential controversies, key stakeholders, or other relevant information..."
            {...register('additionalContext')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
