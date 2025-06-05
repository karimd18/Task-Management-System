using AutoMapper;
using FinalProjectAPIs.Models;
using FinalProjectAPIs.Models.Dto;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User Mappings
        CreateMap<User, UserDTO_GET>();
        CreateMap<User, UserPublicDTO_GET>();
        CreateMap<UserDTO_POST, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore());

        // Team Mappings
        CreateMap<Team, TeamDTO_GET>()
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members))
            .ForMember(dest => dest.Statuses, opt => opt.MapFrom(src => src.Statuses));

        CreateMap<TeamDTO_POST, Team>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Members, opt => opt.Ignore())
            .ForMember(dest => dest.Invitations, opt => opt.Ignore());

        CreateMap<TeamDTO_PUT, Team>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Members, opt => opt.Ignore())
            .ForMember(dest => dest.Invitations, opt => opt.Ignore());

        // Member Mappings
        CreateMap<Member, MemberDTO_GET>()
            .ForMember(dest => dest.UserDetails, opt => opt.MapFrom(src => src.User));
        
        CreateMap<MemberDTO_POST, Member>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Team, opt => opt.Ignore());

        CreateMap<MemberDTO_PUT, Member>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TeamId, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore());

        // Status Mappings
        CreateMap<Status, StatusDTO_GET>();
        CreateMap<StatusDTO_POST, Status>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

        CreateMap<StatusDTO_PUT, Status>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TeamId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

        // Task Mappings
        CreateMap<TaskEntity, TaskEntityDTO_GET>()
            .ForMember(dest => dest.AssignedToUser, 
                opt => opt.MapFrom(src => src.AssignedToUser))
            .ForMember(dest => dest.Status, 
                opt => opt.MapFrom(src => src.Status));

        CreateMap<TaskEntityDTO_POST, TaskEntity>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedToUser, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore());

        CreateMap<TaskEntityDTO_PUT, TaskEntity>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.IsPersonal, opt => opt.Ignore())
            .ForMember(dest => dest.TeamId, opt => opt.Ignore());

        // Invitation Mappings
        CreateMap<Invitation, InvitationResponseDTO>()
            .ForMember(dest => dest.TeamName, 
                opt => opt.MapFrom(src => src.Team.Name))
            .ForMember(dest => dest.InviterUsername, 
                opt => opt.MapFrom(src => src.Inviter.Username));

        CreateMap<Invitation, InvitationDTO_GET>()
            .ForMember(dest => dest.InviterUsername, 
                opt => opt.MapFrom(src => src.Inviter.Username));

        CreateMap<InvitationDTO_POST, Invitation>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.InviterId, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
    }
}