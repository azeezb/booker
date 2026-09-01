using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMeetingIndexesAndMemberRoleEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "ClubMembers",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_ScheduledDate",
                table: "Meetings",
                column: "ScheduledDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Meetings_ScheduledDate",
                table: "Meetings");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "ClubMembers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);
        }
    }
}
