import {
	Column,
	Entity,
	Index,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JobPreset as IJobPreset } from '@gauzy/models';
import { TenantOrganizationBase } from '../core/entities/tenant-organization-base';
import { Employee } from '../employee/employee.entity';
import { JobPresetUpworkJobSearchCriterion } from './job-preset-upwork-job-search-criterion.entity';
import { EmployeeUpworkJobsSearchCriterion } from './employee-upwork-jobs-search-criterion.entity';

@Entity('job_preset')
export class JobPreset extends TenantOrganizationBase implements IJobPreset {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	name?: string;

	@ManyToMany(() => Employee, (employee) => employee.jobPresets, {
		cascade: true
	})
	@JoinTable({
		name: 'time_slot_time_logs'
	})
	employees?: Employee[];

	@OneToMany(
		() => EmployeeUpworkJobsSearchCriterion,
		(employeeUpworkJobsSearchCriterion) =>
			employeeUpworkJobsSearchCriterion.jobPreset
	)
	employeeCriterion?: EmployeeUpworkJobsSearchCriterion[];

	@OneToMany(
		() => JobPresetUpworkJobSearchCriterion,
		(jobPresetUpworkJobSearchCriterion) =>
			jobPresetUpworkJobSearchCriterion.jobPreset
	)
	jobPresetCriterion?: JobPresetUpworkJobSearchCriterion[];
}
